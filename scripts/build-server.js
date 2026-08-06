const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const platformArchToRid = {
  "win32:x64": "win-x64",
  "win32:arm64": "win-arm64",
  "linux:x64": "linux-x64",
  "linux:arm64": "linux-arm64",
  "darwin:x64": "osx-x64",
  "darwin:arm64": "osx-arm64"
};

function detectRid() {
  const key = `${process.platform}:${process.arch}`;
  const rid = platformArchToRid[key];
  if (rid === undefined) {
    throw new Error(`Unsupported platform/arch combination: ${key}. Pass --rid <rid> explicitly.`);
  }

  return rid;
}

function parseRidArg() {
  const flagIndex = process.argv.indexOf("--rid");
  if (flagIndex !== -1 && process.argv[flagIndex + 1] !== undefined) {
    return process.argv[flagIndex + 1];
  }

  return process.env.RID;
}

const rid = parseRidArg() || detectRid();
const repoRoot = process.env.LOOM_REPO || path.resolve(__dirname, "..", "..", "..", "c#", "Loom");
const csproj = path.join(repoRoot, "Loom.LanguageServer", "Loom.LanguageServer.csproj");

if (!fs.existsSync(csproj)) {
  console.error(`Could not find Loom.LanguageServer.csproj at: ${csproj}`);
  console.error("Set the LOOM_REPO environment variable to the root of the rbx-loom/loom checkout.");
  process.exit(1);
}

const outDir = path.resolve(__dirname, "..", "server");
fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });

console.log(`Publishing Loom.LanguageServer (${rid}) from ${repoRoot} into ${outDir}`);

execFileSync(
  "dotnet",
  [
    "publish",
    csproj,
    "-c", "Release",
    "-r", rid,
    "--self-contained", "true",
    "-p:PublishSingleFile=true",
    "-p:IncludeNativeLibrariesForSelfExtract=true",
    "-p:EnableCompressionInSingleFile=true",
    "-p:DebugType=none",
    "-o", outDir
  ],
  { stdio: "inherit" }
);

const executableName = rid.startsWith("win") ? "Loom.LanguageServer.exe" : "Loom.LanguageServer";
const executablePath = path.join(outDir, executableName);
if (!fs.existsSync(executablePath)) {
  console.error(`Expected to find ${executablePath} after publishing, but it wasn't there.`);
  process.exit(1);
}

for (const entry of fs.readdirSync(outDir)) {
  if (entry !== executableName) {
    fs.rmSync(path.join(outDir, entry), { recursive: true, force: true });
  }
}

if (!rid.startsWith("win")) {
  fs.chmodSync(executablePath, 0o755);
}

const { size } = fs.statSync(executablePath);
console.log(`Built ${executablePath} (${(size / 1024 / 1024).toFixed(1)} MB)`);
