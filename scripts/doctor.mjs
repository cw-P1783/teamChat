import { spawnSync } from "node:child_process";
import { existsSync, realpathSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectDirectory = fileURLToPath(new URL("..", import.meta.url));
const gitEnvironment = Object.fromEntries(
  Object.entries(process.env).filter(([name]) => !name.startsWith("GIT_")),
);
let failures = 0;

function report(level, message) {
  console.log(`[${level}] ${message}`);
  if (level === "FAIL") failures += 1;
}

function run(command, args, env = process.env) {
  return spawnSync(command, args, {
    cwd: projectDirectory,
    env,
    encoding: "utf8",
    timeout: 15_000,
    windowsHide: true,
  });
}

function npm(args) {
  // npm run supplies its JS entry point, avoiding shell command interpolation.
  if (process.env.npm_execpath && existsSync(process.env.npm_execpath)) {
    return run(process.execPath, [process.env.npm_execpath, ...args]);
  }
  if (process.platform === "win32") {
    return run("cmd.exe", ["/d", "/s", "/c", "npm", ...args]);
  }
  return run("npm", args);
}

console.log("Team Chat 실습 환경 점검 (읽기 전용)\n");

const nodeMajor = Number(process.versions.node.split(".")[0]);
report(
  nodeMajor === 24 ? "OK" : "FAIL",
  `Node.js ${process.versions.node}${nodeMajor === 24 ? "" : " — 24.x로 맞추세요 (.nvmrc 참고)."}`,
);

const gitVersion = run("git", ["--version"], gitEnvironment);
const hasGit = !gitVersion.error && gitVersion.status === 0;
report(hasGit ? "OK" : "FAIL", hasGit ? "Git 실행 가능" : "Git을 설치하고 터미널을 다시 여세요.");

const npmVersion = npm(["--version"]);
const hasNpm = !npmVersion.error && npmVersion.status === 0;
report(hasNpm ? "OK" : "FAIL", hasNpm ? "npm 실행 가능" : "npm 실행 실패 — Node.js 24 설치를 확인하세요.");

if (hasNpm) {
  const npmRegistry = npm(["config", "get", "registry"]);
  report(
    !npmRegistry.error && npmRegistry.status === 0 ? "OK" : "WARN",
    !npmRegistry.error && npmRegistry.status === 0
      ? "선택 점검: npm registry 설정 읽기 가능 (설정값은 표시하지 않음)"
      : "선택 점검: npm registry 설정을 읽지 못했습니다. npm ci 실패 시 설정을 확인하세요.",
  );
}

const modulesDirectory = resolve(projectDirectory, "node_modules");
const hasDependencies = existsSync(modulesDirectory) && statSync(modulesDirectory).isDirectory();
report(
  hasDependencies ? "OK" : "FAIL",
  hasDependencies ? "프로젝트 node_modules 존재" : "프로젝트 의존성 없음 — 이 폴더에서 npm ci를 실행하세요.",
);

if (hasGit) {
  const repository = run("git", ["rev-parse", "--show-toplevel"], gitEnvironment);
  if (!repository.error && repository.status === 0) {
    const repositoryDirectory = repository.stdout.trim();
    const isProjectRepository =
      existsSync(repositoryDirectory) &&
      realpathSync(repositoryDirectory) === realpathSync(projectDirectory);
    if (isProjectRepository) {
      const remotes = run("git", ["remote"], gitEnvironment);
      const remoteCount = remotes.stdout?.trim().split(/\r?\n/).filter(Boolean).length ?? 0;
      report(
        !remotes.error && remotes.status === 0 && remoteCount > 0 ? "OK" : "WARN",
        remoteCount > 0
          ? `Git 원격 연결 ${remoteCount}개 확인 (URL·인증정보는 표시하지 않음)`
          : "Git 원격 연결 없음 — 진행자가 준 GitHub 저장소를 clone했는지 확인하세요.",
      );
    } else {
      report("WARN", "프로젝트가 상위 Git 저장소 안에 있습니다. 실습용 clone 폴더를 확인하세요.");
    }
  } else {
    report("WARN", "현재 폴더는 Git 저장소가 아닙니다. 진행자가 준 저장소를 clone한 폴더에서 실습하세요.");
  }
}

console.log(`\n${failures === 0 ? "기본 환경 점검 통과" : `필수 점검 ${failures}개 실패`}.`);
console.log("원격 인증·네트워크 접근·설치된 패키지의 버전은 이 명령으로 검증하지 않습니다.");
process.exitCode = failures === 0 ? 0 : 1;
