import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import * as Location from 'expo-location';
import { Accelerometer } from 'expo-sensors';
import * as ImagePicker from 'expo-image-picker';
import { GradientBackground } from '../components/GradientBackground';
import { Card } from '../components/Card';
import { MagicButton } from '../components/MagicButton';
import { AppTextInput } from '../components/AppTextInput';
import { GpsAccuracyBadge } from '../components/GpsAccuracyBadge';
import { loadAuditHistory, saveAuditRecord } from '../services/storage';
import { colors, radii, spacing, typography } from '../theme';

/**
 * Tela de Registro de Visitas Técnicas & Auditoria
 * Atende:
 * - Nível Pleno: Telemetria com Acelerômetro e trava por instabilidade (> 2.0g)
 * - Nível Júnior: Validação de permissões da Câmera (canAskAgain: false -> Linking.openSettings)
 * - RF01: Histórico local e persistência em AsyncStorage para consulta offline
 * - RF02: Feedback visual colorido de precisão GPS (<10m verde, 10-30m amarelo, >30m vermelho)
 * - RNF01: Degradação graciosa para GPS desligado ou sensores indisponíveis
 * - RNF02: UI responsiva para Portrait e Landscape
 */
export function AuditScreen() {
  const navigation = useNavigation();
  const { width } = useWindowDimensions();
  const isLandscape = width > 600;

  const [activeTab, setActiveTab] = useState('new'); // 'new' | 'history'

  // Dados do formulário
  const [title, setTitle] = useState('');
  const [producer, setProducer] = useState('');
  const [notes, setNotes] = useState('');
  const [photoUri, setPhotoUri] = useState(null);

  // GPS (RF02 & RNF01)
  const [location, setLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [gpsError, setGpsError] = useState(null);

  // Acelerômetro (Nível Pleno & RNF01)
  const [accelAvailable, setAccelAvailable] = useState(true);
  const [accelData, setAccelData] = useState({ x: 0, y: 0, z: 1 });
  const [currentG, setCurrentG] = useState(1.0);
  const currentGRef = useRef(1.0);

  // Histórico (RF01)
  const [history, setHistory] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  // Inicialização de Sensores e Histórico
  useEffect(() => {
    loadSavedHistory();
    initSensors();
    captureGps();

    return () => {
      // Limpeza de listeners ao desmontar
      Accelerometer.removeAllListeners();
    };
  }, []);

  const loadSavedHistory = async () => {
    try {
      const records = await loadAuditHistory();
      setHistory(records);
    } catch {
      // RNF01: Degradação graciosa
      setHistory([]);
    }
  };

  const initSensors = async () => {
    try {
      const available = await Accelerometer.isAvailableAsync();
      setAccelAvailable(available);

      if (available) {
        Accelerometer.setUpdateInterval(100);
        Accelerometer.addListener((data) => {
          setAccelData(data);
          // Cálculo da aceleração vetorial agregada: sqrt(x² + y² + z²)
          const aggregateG = Math.sqrt(
            data.x * data.x + data.y * data.y + data.z * data.z
          );
          setCurrentG(aggregateG);
          currentGRef.current = aggregateG;
        });
      }
    } catch (e) {
      setAccelAvailable(false);
    }
  };

  // RF02 & RNF01: Captura de GPS e tratamento de erros/degradação
  const captureGps = async () => {
    setLocationLoading(true);
    setGpsError(null);
    try {
      // RNF01: Verifica se os serviços de GPS estão habilitados no aparelho
      const providerStatus = await Location.getProviderStatusAsync();
      if (!providerStatus.locationServicesEnabled) {
        setGpsError('O serviço de GPS está desativado no aparelho. Por favor, ative a localização.');
        setLocationLoading(false);
        return;
      }

      const perm = await Location.requestForegroundPermissionsAsync();
      if (!perm.granted) {
        if (perm.canAskAgain === false) {
          setGpsError('Permissão de GPS bloqueada permanentemente. Habilite nas configurações.');
          Alert.alert(
            'Permissão de GPS Bloqueada',
            'O acesso à localização foi negado ("Não perguntar novamente"). Deseja abrir as configurações do sistema para autorizar?',
            [
              { text: 'Cancelar', style: 'cancel' },
              { text: 'Abrir Configurações', onPress: () => Linking.openSettings() },
            ]
          );
        } else {
          setGpsError('Permissão de GPS necessária para capturar as coordenadas da visita.');
        }
        setLocationLoading(false);
        return;
      }

      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setLocation(pos);
    } catch (err) {
      // RNF01: Degradação graciosa
      setGpsError('Não foi possível obter a posição GPS no momento.');
    } finally {
      setLocationLoading(false);
    }
  };

  // Nível Júnior & RNF01: Captura de Foto pela Câmera com tratamento de canAskAgain: false
  const handleTakePhoto = async () => {
    try {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) {
        if (perm.canAskAgain === false) {
          Alert.alert(
            'Permissão da Câmera Bloqueada',
            'O aplicativo não possui autorização para usar a câmera e a opção "Não perguntar novamente" está ativa. Para anexar fotos de auditoria, vá até as Configurações do sistema e habilite a permissão de Câmera.',
            [
              { text: 'Cancelar', style: 'cancel' },
              { text: 'Abrir Configurações', onPress: () => Linking.openSettings() },
            ]
          );
        } else {
          Alert.alert(
            'Permissão necessária',
            'O acesso à câmera é necessário para registrar a evidência fotográfica da visita.'
          );
        }
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
      });

      if (!result.canceled && result.assets && result.assets[0]?.uri) {
        setPhotoUri(result.assets[0].uri);
      }
    } catch (error) {
      // RNF01: Tratamento de erro se a câmera física falhar
      Alert.alert(
        'Câmera Indisponível',
        'Não foi possível inicializar o hardware da câmera. Detalhe: ' + error.message
      );
    }
  };

  // Nível Pleno: Trava de segurança baseada em movimento com Acelerômetro (> 2.0g)
  const handleSubmitAudit = async () => {
    if (!title.trim()) {
      Alert.alert('Atenção', 'Informe o título ou objetivo da auditoria.');
      return;
    }

    const latestG = currentGRef.current;

    // Nível Pleno: Se a aceleração ultrapassar 2.0g, o envio DEVE ser bloqueado
    if (latestG > 2.0) {
      Alert.alert(
        'Instabilidade Física Detectada',
        `A aceleração vetorial agregada ultrapassou a taxa segura de 2.0g (${latestG.toFixed(2)}g). O envio foi bloqueado para proteger a integridade do registro. Mantenha o dispositivo imóvel e tente novamente.`
      );
      return;
    }

    setSubmitting(true);

    try {
      // RF01: Persistência local no dispositivo (AsyncStorage)
      const newRecord = {
        id: 'audit_' + Date.now(),
        createdAt: new Date().toISOString(),
        title: title.trim(),
        producer: producer.trim() || 'Não informado',
        notes: notes.trim(),
        photoUri,
        // RF02: Coordenadas e precisão de GPS
        coords: location
          ? {
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              accuracy: location.coords.accuracy,
            }
          : null,
        // Telemetria no momento do envio
        telemetry: {
          aggregateG: latestG,
          x: accelData.x,
          y: accelData.y,
          z: accelData.z,
        },
      };

      const updated = await saveAuditRecord(newRecord);
      setHistory(updated);
      setSubmitting(false);

      // Limpar campos
      setTitle('');
      setProducer('');
      setNotes('');
      setPhotoUri(null);

      Alert.alert('Sucesso! ✨', 'Auditoria técnica registrada e salva localmente no histórico offline.', [
        { text: 'Ver Histórico', onPress: () => setActiveTab('history') },
        { text: 'OK' },
      ]);
    } catch (error) {
      setSubmitting(false);
      Alert.alert('Erro', 'Não foi possível salvar o registro localmente: ' + error.message);
    }
  };

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safe} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backText}>‹ Voltar</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Auditoria Técnica & Campo</Text>
          <Text style={styles.subtitle}>
            Hardware, Telemetria com Acelerômetro e Precisão GPS
          </Text>
        </View>

        {/* Segmented Control de Abas */}
        <View style={styles.tabsRow}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'new' && styles.tabButtonActive]}
            onPress={() => setActiveTab('new')}>
            <Text style={[styles.tabButtonText, activeTab === 'new' && styles.tabButtonTextActive]}>
              📝 Novo Registro
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'history' && styles.tabButtonActive]}
            onPress={() => setActiveTab('history')}>
            <Text
              style={[styles.tabButtonText, activeTab === 'history' && styles.tabButtonTextActive]}>
              📂 Histórico Offline ({history.length})
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'new' ? (
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled">
            {/* CARD 1: Telemetria com Acelerômetro (Nível Pleno) */}
            <Card style={styles.sectionCard}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardHeaderIcon}>⚡</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardHeaderTitle}>Telemetria do Acelerômetro</Text>
                  <Text style={styles.cardHeaderSubtitle}>
                    Trava de segurança ativada se aceleração &gt; 2.0g
                  </Text>
                </View>
                <View
                  style={[
                    styles.telemetryPill,
                    currentG > 2.0 ? styles.telemetryPillDanger : styles.telemetryPillOk,
                  ]}>
                  <Text
                    style={[
                      styles.telemetryPillText,
                      currentG > 2.0 ? styles.telemetryPillTextDanger : styles.telemetryPillTextOk,
                    ]}>
                    {currentG.toFixed(2)}g
                  </Text>
                </View>
              </View>

              {accelAvailable ? (
                <View style={styles.axesRow}>
                  <View style={styles.axisBox}>
                    <Text style={styles.axisLabel}>Eixo X</Text>
                    <Text style={styles.axisValue}>{accelData.x.toFixed(2)}g</Text>
                  </View>
                  <View style={styles.axisBox}>
                    <Text style={styles.axisLabel}>Eixo Y</Text>
                    <Text style={styles.axisValue}>{accelData.y.toFixed(2)}g</Text>
                  </View>
                  <View style={styles.axisBox}>
                    <Text style={styles.axisLabel}>Eixo Z</Text>
                    <Text style={styles.axisValue}>{accelData.z.toFixed(2)}g</Text>
                  </View>
                </View>
              ) : (
                <Text style={styles.warningText}>
                  ⚠️ Sensor de acelerômetro indisponível neste emulador/dispositivo.
                </Text>
              )}

              {currentG > 2.0 && (
                <View style={styles.dangerBanner}>
                  <Text style={styles.dangerBannerText}>
                    🚨 ATENÇÃO: Movimentação brusca detectada! Envio bloqueado até estabilização.
                  </Text>
                </View>
              )}
            </Card>

            {/* CARD 2: GPS & Precisão (RF02 & RNF01) */}
            <Card style={styles.sectionCard}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardHeaderIcon}>📍</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardHeaderTitle}>Sinal GPS & Localização</Text>
                  <Text style={styles.cardHeaderSubtitle}>
                    Precisão visual: Verde &lt; 10m | Amarelo 10-30m | Vermelho &gt; 30m
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={captureGps}
                  style={styles.refreshGpsBtn}
                  disabled={locationLoading}>
                  {locationLoading ? (
                    <ActivityIndicator size="small" color={colors.primaryLight} />
                  ) : (
                    <Text style={styles.refreshGpsText}>🔄 Atualizar</Text>
                  )}
                </TouchableOpacity>
              </View>

              {gpsError ? (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>⚠️ {gpsError}</Text>
                  <TouchableOpacity
                    style={styles.retryBtn}
                    onPress={() => Linking.openSettings()}>
                    <Text style={styles.retryBtnText}>Abrir Configurações do Sistema</Text>
                  </TouchableOpacity>
                </View>
              ) : location ? (
                <View style={styles.gpsDetails}>
                  <GpsAccuracyBadge accuracy={location.coords.accuracy} />
                  <View style={styles.coordsRow}>
                    <Text style={styles.coordsLabel}>Lat:</Text>
                    <Text style={styles.coordsValue}>{location.coords.latitude.toFixed(6)}°</Text>
                    <Text style={styles.coordsLabel}>Long:</Text>
                    <Text style={styles.coordsValue}>{location.coords.longitude.toFixed(6)}°</Text>
                  </View>
                </View>
              ) : (
                <GpsAccuracyBadge accuracy={null} />
              )}
            </Card>

            {/* CARD 3: Câmera & Evidência Fotográfica (Nível Júnior) */}
            <Card style={styles.sectionCard}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardHeaderIcon}>📷</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardHeaderTitle}>Evidência Fotográfica</Text>
                  <Text style={styles.cardHeaderSubtitle}>
                    Captura direta via câmera com validação de permissão
                  </Text>
                </View>
              </View>

              {photoUri ? (
                <View style={styles.photoPreviewWrap}>
                  <Image source={{ uri: photoUri }} style={styles.photoPreview} />
                  <TouchableOpacity
                    style={styles.photoRemoveBtn}
                    onPress={() => setPhotoUri(null)}>
                    <Text style={styles.photoRemoveText}>✕ Remover Foto</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity style={styles.cameraActionBtn} onPress={handleTakePhoto}>
                  <Text style={styles.cameraActionIcon}>📸</Text>
                  <Text style={styles.cameraActionTitle}>Tirar Foto com a Câmera</Text>
                  <Text style={styles.cameraActionSubtitle}>
                    Valida permissão e trata "Não perguntar novamente"
                  </Text>
                </TouchableOpacity>
              )}
            </Card>

            {/* CARD 4: Dados da Auditoria / Visita */}
            <Card style={styles.sectionCard}>
              <Text style={styles.cardHeaderTitle}>Dados do Registro</Text>
              <AppTextInput
                label="Título / Objetivo da Visita"
                placeholder="Ex: Inspeção de Cultivo / Auditoria de Código"
                value={title}
                onChangeText={setTitle}
              />
              <AppTextInput
                label="Produtor / Cliente / Responsável"
                placeholder="Ex: Fazenda Boa Esperança / Tech Team"
                value={producer}
                onChangeText={setProducer}
              />
              <AppTextInput
                label="Parecer Técnico / Observações"
                placeholder="Descreva o estado, anomalias ou observações coletadas no campo..."
                value={notes}
                onChangeText={setNotes}
                multiline
              />

              <MagicButton
                title={submitting ? 'Salvando...' : '🔒 Concluir e Enviar Auditoria'}
                onPress={handleSubmitAudit}
                loading={submitting}
              />
            </Card>
          </ScrollView>
        ) : (
          /* Aba de Histórico Offline (RF01) */
          <ScrollView contentContainerStyle={styles.scroll}>
            <View style={styles.historyHeader}>
              <Text style={styles.historyTitle}>Registros Salvos Localmente</Text>
              <Text style={styles.historySubtitle}>
                Dados persistidos offline via AsyncStorage (RF01)
              </Text>
            </View>

            {history.length === 0 ? (
              <Card style={styles.emptyCard}>
                <Text style={styles.emptyIcon}>📂</Text>
                <Text style={styles.emptyTitle}>Nenhum registro ainda</Text>
                <Text style={styles.emptySubtitle}>
                  Conclua uma nova auditoria para visualizar o histórico aqui mesmo sem conexão.
                </Text>
              </Card>
            ) : (
              history.map((rec) => (
                <Card key={rec.id} style={styles.historyCard}>
                  <View style={styles.historyCardHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.historyCardTitle}>{rec.title}</Text>
                      <Text style={styles.historyCardDate}>
                        📅 {new Date(rec.createdAt).toLocaleString('pt-BR')}
                      </Text>
                      <Text style={styles.historyCardProducer}>👤 {rec.producer}</Text>
                    </View>
                    {rec.photoUri && (
                      <Image source={{ uri: rec.photoUri }} style={styles.historyThumb} />
                    )}
                  </View>

                  {rec.coords && (
                    <View style={styles.historyGpsRow}>
                      <GpsAccuracyBadge accuracy={rec.coords.accuracy} />
                      <Text style={styles.historyCoordsText}>
                        {rec.coords.latitude.toFixed(4)}°, {rec.coords.longitude.toFixed(4)}°
                      </Text>
                    </View>
                  )}

                  {rec.telemetry && (
                    <Text style={styles.historyAccelText}>
                      ⚡ Aceleração no envio: {rec.telemetry.aggregateG.toFixed(2)}g (Estável)
                    </Text>
                  )}

                  {rec.notes ? (
                    <Text style={styles.historyNotesText}>“{rec.notes}”</Text>
                  ) : null}
                </Card>
              ))
            )}
          </ScrollView>
        )}
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, marginBottom: spacing.md },
  backBtn: { marginBottom: spacing.sm },
  backText: { color: colors.primaryLight, fontSize: typography.subheading, fontWeight: '600' },
  title: { color: colors.text, fontSize: typography.title, fontWeight: '700' },
  subtitle: { color: colors.textMuted, fontSize: typography.caption, marginTop: spacing.xs },
  tabsRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  tabButton: {
    flex: 1,
    paddingVertical: spacing.sm + 2,
    alignItems: 'center',
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primaryLight,
  },
  tabButtonText: {
    color: colors.textMuted,
    fontSize: typography.caption,
    fontWeight: '600',
  },
  tabButtonTextActive: {
    color: colors.white,
    fontWeight: '700',
  },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxl },
  sectionCard: { marginBottom: spacing.lg },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  cardHeaderIcon: { fontSize: 24 },
  cardHeaderTitle: { color: colors.text, fontSize: typography.body, fontWeight: '700' },
  cardHeaderSubtitle: { color: colors.textMuted, fontSize: typography.caption, marginTop: 2 },
  telemetryPill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.pill,
    borderWidth: 1,
  },
  telemetryPillOk: {
    backgroundColor: '#0F2E24',
    borderColor: '#10B981',
  },
  telemetryPillDanger: {
    backgroundColor: '#3E1015',
    borderColor: '#EF4444',
  },
  telemetryPillText: { fontSize: typography.caption, fontWeight: '700' },
  telemetryPillTextOk: { color: '#34D399' },
  telemetryPillTextDanger: { color: '#F87171' },
  axesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  axisBox: {
    flex: 1,
    backgroundColor: '#120C26',
    padding: spacing.sm,
    borderRadius: radii.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  axisLabel: { color: colors.textMuted, fontSize: typography.small },
  axisValue: { color: colors.text, fontSize: typography.caption, fontWeight: '700', marginTop: 2 },
  warningText: { color: '#FBBF24', fontSize: typography.caption, marginTop: spacing.xs },
  dangerBanner: {
    backgroundColor: '#4A121A',
    borderWidth: 1,
    borderColor: '#EF4444',
    borderRadius: radii.sm,
    padding: spacing.sm,
    marginTop: spacing.sm,
  },
  dangerBannerText: { color: '#FCA5A5', fontSize: typography.caption, fontWeight: '700' },
  refreshGpsBtn: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.sm,
    backgroundColor: colors.surfaceHover,
  },
  refreshGpsText: { color: colors.primaryLight, fontSize: typography.small, fontWeight: '600' },
  errorBox: {
    backgroundColor: '#2E1420',
    borderColor: '#EF4444',
    borderWidth: 1,
    padding: spacing.md,
    borderRadius: radii.md,
    gap: spacing.sm,
  },
  errorText: { color: '#FCA5A5', fontSize: typography.caption },
  retryBtn: {
    alignSelf: 'flex-start',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: radii.sm,
  },
  retryBtnText: { color: colors.white, fontSize: typography.small, fontWeight: '600' },
  gpsDetails: { gap: spacing.sm },
  coordsRow: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center', flexWrap: 'wrap' },
  coordsLabel: { color: colors.textMuted, fontSize: typography.caption },
  coordsValue: { color: colors.text, fontSize: typography.caption, fontWeight: '700' },
  cameraActionBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    backgroundColor: '#120C26',
    gap: spacing.xs,
  },
  cameraActionIcon: { fontSize: 36 },
  cameraActionTitle: { color: colors.text, fontSize: typography.body, fontWeight: '700' },
  cameraActionSubtitle: { color: colors.textMuted, fontSize: typography.small, textAlign: 'center' },
  photoPreviewWrap: { position: 'relative', alignItems: 'center' },
  photoPreview: { width: '100%', height: 200, borderRadius: radii.md },
  photoRemoveBtn: {
    marginTop: spacing.sm,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radii.pill,
    backgroundColor: '#4A121A',
  },
  photoRemoveText: { color: '#FCA5A5', fontSize: typography.small, fontWeight: '700' },
  historyHeader: { marginBottom: spacing.md },
  historyTitle: { color: colors.text, fontSize: typography.heading, fontWeight: '700' },
  historySubtitle: { color: colors.textMuted, fontSize: typography.caption, marginTop: 2 },
  emptyCard: { alignItems: 'center', padding: spacing.xxl, gap: spacing.sm },
  emptyIcon: { fontSize: 44 },
  emptyTitle: { color: colors.text, fontSize: typography.subheading, fontWeight: '700' },
  emptySubtitle: { color: colors.textMuted, fontSize: typography.caption, textAlign: 'center' },
  historyCard: { marginBottom: spacing.md, gap: spacing.sm },
  historyCardHeader: { flexDirection: 'row', gap: spacing.md },
  historyCardTitle: { color: colors.text, fontSize: typography.subheading, fontWeight: '700' },
  historyCardDate: { color: colors.textMuted, fontSize: typography.small, marginTop: 2 },
  historyCardProducer: { color: colors.textLight, fontSize: typography.caption, marginTop: 2 },
  historyThumb: { width: 60, height: 60, borderRadius: radii.sm },
  historyGpsRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, flexWrap: 'wrap' },
  historyCoordsText: { color: colors.textMuted, fontSize: typography.small },
  historyAccelText: { color: '#34D399', fontSize: typography.small, fontWeight: '600' },
  historyNotesText: { color: colors.textLight, fontSize: typography.caption, fontStyle: 'italic' },
});
