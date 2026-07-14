"use client";

import { useState, useCallback } from "react";
import { PDFDocument } from "pdf-lib";
import UploadArea from "./shared/upload-area";
import { downloadBlob, formatFileSize } from "@/lib/image-utils";

type Mode = "encrypt" | "decrypt";

// Custom AES-GCM encrypted format: 4-byte magic + 16-byte salt + 12-byte IV + encrypted data
const MAGIC_BYTES = new TextEncoder().encode("ADWT") as unknown as Uint8Array;
const ALGORITHM = "AES-GCM";

// Helper to get random bytes with correct TS5 types
function randomBytes(length: number): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(length)) as unknown as Uint8Array;
}

async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(password) as unknown as BufferSource,
    "PBKDF2",
    false,
    ["deriveKey"]
  );
  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt as unknown as BufferSource,
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: ALGORITHM, length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

async function aesEncrypt(data: Uint8Array, password: string): Promise<Uint8Array> {
  const salt = randomBytes(16);
  const key = await deriveKey(password, salt);
  const iv = randomBytes(12);

  const ciphertext = await crypto.subtle.encrypt(
    { name: ALGORITHM, iv: iv as unknown as BufferSource },
    key,
    data as unknown as BufferSource
  );

  // Format: MAGIC(4) + salt(16) + iv(12) + ciphertext
  const ct = new Uint8Array(ciphertext);
  const result = new Uint8Array(4 + 16 + 12 + ct.length);
  result.set(MAGIC_BYTES, 0);
  result.set(salt, 4);
  result.set(iv, 20);
  result.set(ct, 32);
  return result;
}

async function aesDecrypt(data: Uint8Array, password: string): Promise<Uint8Array> {
  if (data.length < 32) throw new Error("ملف غير صالح");

  const magic = data.slice(0, 4);
  if (new TextDecoder().decode(magic) !== "ADWT") {
    throw new Error("ليس ملف Adwati مشفر");
  }

  const salt = data.slice(4, 20);
  const iv = data.slice(20, 32);
  const ciphertext = data.slice(32);

  const key = await deriveKey(password, salt);

  try {
    const plaintext = await crypto.subtle.decrypt(
      { name: ALGORITHM, iv: iv as unknown as BufferSource },
      key,
      ciphertext as unknown as BufferSource
    );
    return new Uint8Array(plaintext);
  } catch {
    throw new Error("كلمة المرور غير صحيحة");
  }
}

export default function ProtectPDF() {
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<Mode>("encrypt");
  const [password, setPassword] = useState("");
  const [processing, setProcessing] = useState(false);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [resultName, setResultName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback((f: File) => {
    setError(null);
    setResultBlob(null);
    setResultName("");
    setFile(f);
  }, []);

  const handleProcess = useCallback(async () => {
    if (!file) return;

    if (!password.trim()) {
      setError("يرجى إدخال كلمة المرور");
      return;
    }

    setProcessing(true);
    setError(null);
    setResultBlob(null);

    try {
      const buf = new Uint8Array(await file.arrayBuffer());

      if (mode === "encrypt") {
        // Verify it's a valid PDF
        try {
          await PDFDocument.load(buf, { ignoreEncryption: true });
        } catch {
          setError("تعذر قراءة ملف PDF. تأكد من أنه ملف PDF صالح.");
          setProcessing(false);
          return;
        }

        // Encrypt with AES-GCM
        const encrypted = await aesEncrypt(buf, password);
        setResultBlob(new Blob([encrypted] as BlobPart[], { type: "application/octet-stream" }));
        setResultName("locked.pdf");
      } else {
        // Decrypt with AES-GCM
        let decrypted: Uint8Array;

        try {
          decrypted = await aesDecrypt(buf, password);
        } catch {
          setError(
            "كلمة المرور غير صحيحة أو الملف غير مشفر. تأكد من كلمة المرور"
          );
          setProcessing(false);
          return;
        }

        // Verify result is valid PDF
        try {
          await PDFDocument.load(decrypted, { ignoreEncryption: true });
        } catch {
          setError("كلمة المرور غير صحيحة أو الملف غير مشفر. تأكد من كلمة المرور");
          setProcessing(false);
          return;
        }

        setResultBlob(new Blob([decrypted] as BlobPart[], { type: "application/pdf" }));
        setResultName("unlocked.pdf");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "حدث خطأ أثناء المعالجة");
    } finally {
      setProcessing(false);
    }
  }, [file, mode, password]);

  const handleDownload = useCallback(() => {
    if (!resultBlob) return;
    downloadBlob(resultBlob, resultName);
  }, [resultBlob, resultName]);

  if (!file) {
    return (
      <UploadArea
        onFileSelect={handleFile}
        accept=".pdf"
        label="اسحب وأفلت ملف PDF هنا"
        hint="يمكنك تشفير الملف أو فك تشفيره"
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* معلومات الملف */}
      <div className="rounded-xl border border-border bg-bg-card p-6">
        <div className="flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-sm font-medium text-text-main truncate">
              📄 {file.name}
            </p>
            <p className="text-xs text-text-muted">{formatFileSize(file.size)}</p>
          </div>
          <button
            onClick={() => {
              setFile(null);
              setResultBlob(null);
              setError(null);
              setPassword("");
            }}
            className="rounded-lg border border-border px-3 py-1.5 text-sm text-text-secondary hover:bg-bg-surface transition-colors"
          >
            تغيير الملف
          </button>
        </div>
      </div>

      {/* خيارات التشفير */}
      <div className="rounded-xl border border-border bg-bg-card p-6">
        <h3 className="text-lg font-bold text-text-main mb-4">
          اختر العملية
        </h3>

        <div className="flex gap-4 mb-6">
          <label
            className={`
              flex-1 rounded-xl border-2 p-4 cursor-pointer transition-all
              ${
                mode === "encrypt"
                  ? "border-primary bg-primary-bg"
                  : "border-border hover:border-primary/40"
              }
            `}
          >
            <input
              type="radio"
              name="mode"
              value="encrypt"
              checked={mode === "encrypt"}
              onChange={() => {
                setMode("encrypt");
                setResultBlob(null);
                setError(null);
              }}
              className="sr-only"
            />
            <div className="text-center">
              <span className="text-3xl mb-2 block">🔒</span>
              <p className="text-sm font-bold text-text-main">تشفير</p>
              <p className="text-xs text-text-muted mt-1">
                حماية الملف بكلمة مرور (AES-256)
              </p>
            </div>
          </label>

          <label
            className={`
              flex-1 rounded-xl border-2 p-4 cursor-pointer transition-all
              ${
                mode === "decrypt"
                  ? "border-primary bg-primary-bg"
                  : "border-border hover:border-primary/40"
              }
            `}
          >
            <input
              type="radio"
              name="mode"
              value="decrypt"
              checked={mode === "decrypt"}
              onChange={() => {
                setMode("decrypt");
                setResultBlob(null);
                setError(null);
              }}
              className="sr-only"
            />
            <div className="text-center">
              <span className="text-3xl mb-2 block">🔓</span>
              <p className="text-sm font-bold text-text-main">فك التشفير</p>
              <p className="text-xs text-text-muted mt-1">
                إزالة كلمة المرور من الملف
              </p>
            </div>
          </label>
        </div>

        {/* إدخال كلمة المرور */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-text-secondary">
            {mode === "encrypt" ? "كلمة المرور للتشفير" : "كلمة المرور لفك التشفير"}
          </label>
          <div className="flex items-center gap-3">
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(null);
              }}
              placeholder="أدخل كلمة المرور"
              className="flex-1 rounded-lg border border-border bg-bg-main px-4 py-3 text-text-main text-sm placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30"
              dir="ltr"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleProcess();
              }}
            />
          </div>
        </div>

        {/* رسالة الخصوصية */}
        <p className="mt-3 text-xs text-text-muted flex items-center gap-1">
          <span>🛡️</span>
          كلمة المرور لا تُخزّن ولا تُرسل — المعالجة تتم في متصفحك فقط
          {mode === "encrypt" && (
            <span className="mr-1">
              | التشفير باستخدام AES-256-GCM مع PBKDF2
            </span>
          )}
        </p>

        <div className="flex items-center gap-3 mt-5">
          <button
            onClick={handleProcess}
            disabled={processing || !password.trim()}
            className="rounded-lg bg-primary px-6 py-3 text-white font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50"
          >
            {processing ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                جاري المعالجة...
              </span>
            ) : mode === "encrypt" ? (
              "تشفير 🔒"
            ) : (
              "فك التشفير 🔓"
            )}
          </button>

          {resultBlob && (
            <button
              onClick={handleDownload}
              className="rounded-lg bg-success px-6 py-3 text-white font-semibold hover:opacity-90 transition-opacity"
            >
              تحميل {resultName} ⬇️
            </button>
          )}
        </div>

        {error && <p className="mt-3 text-sm text-danger">{error}</p>}
      </div>
    </div>
  );
}
