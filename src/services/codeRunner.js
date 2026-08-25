/**
 * Contrato do Judge0 (https://judge0.com) — executor de código.
 *
 * Fluxo real:
 *  1. POST {JUDGE0_URL}/submissions?base64_encoded=false&wait=true
 *     body: { source_code, language_id, stdin }
 *  2. Resposta: { token, stdout, stderr, status: { id, description }, compile_output }
 *
 * language_id padrão do Judge0:
 *  - C (GCC): 50
 *  - Python: 71 (não usado; Portugol roda como pseudo-código)
 *
 * Como o Judge0 ainda não está exposto, usamos um mock que valida se o código
 * contém as palavras-chave esperadas pelo desafio.
 */
export const JUDGE0_URL = process.env.EXPO_PUBLIC_JUDGE0_URL ?? 'http://localhost:2358';

export const JUDGE0_LANGUAGE_IDS = {
  c: 50,
  cpp: 54,
  python: 71,
};

export async function runCode(request, expected) {
  if (process.env.EXPO_PUBLIC_JUDGE0_URL) {
    return runCodeJudge0(request, expected);
  }
  return runCodeMock(request, expected);
}

async function runCodeJudge0(request, expected) {
  const languageId = JUDGE0_LANGUAGE_IDS[request.language] ?? 50;
  const res = await fetch(`${JUDGE0_URL}/submissions?base64_encoded=false&wait=true`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      source_code: request.code,
      language_id: languageId,
      stdin: request.stdin ?? '',
    }),
  });
  const data = await res.json();
  const statusId = data?.status?.id ?? -1;
  const stdout = data?.stdout ?? null;

  let passed = statusId === 3;
  if (expected?.output && stdout != null) {
    passed = stdout.trim() === expected.output.trim();
  }

  return {
    stdout,
    stderr: data?.stderr ?? data?.compile_output ?? null,
    status: data?.status?.description ?? 'Error',
    passed,
    exitCode: data?.exit_code ?? null,
  };
}

function runCodeMock(request, expected) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(evaluateMock(request, expected));
    }, 700);
  });
}

function evaluateMock(request, expected) {
  const code = request.code ?? '';
  const lower = code.toLowerCase();

  if (!lower.trim()) {
    return {
      stdout: null,
      stderr: 'Nenhum código foi escrito. Escreva a solução e tente novamente!',
      status: 'Error',
      passed: false,
      exitCode: 1,
    };
  }

  if (expected?.keywords && expected.keywords.length > 0) {
    const missing = expected.keywords.filter((kw) => !lower.includes(kw.toLowerCase()));
    if (missing.length > 0) {
      return {
        stdout: null,
        stderr: `Faltou usar: ${missing.join(', ')}. Confira o enunciado e tente de novo.`,
        status: 'Wrong Answer',
        passed: false,
        exitCode: 0,
      };
    }
  }

  return {
    stdout: expected?.output ?? '✅ Código executado com sucesso!',
    stderr: null,
    status: 'Accepted',
    passed: true,
    exitCode: 0,
  };
}
