"use client";
import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Play, Trash2, Copy, Check, Terminal, Code2, ChevronDown, Zap, AlertTriangle, Clock, BookOpen } from "lucide-react";

// Monaco editor loaded dynamically to avoid SSR issues
const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

const LANGUAGES = [
  {
    id: "python",
    label: "Python",
    icon: "🐍",
    monacoLang: "python",
    version: "3.12.7",
    color: "#3b82f6",
    bgColor: "rgba(59, 130, 246, 0.1)",
    defaultCode: `# Python Virtual Lab
# Press Ctrl+Enter to run your code

def greet(name):
    return f"Hello, {name}! Welcome to the Virtual Lab."

# Example: Working with lists
numbers = [1, 2, 3, 4, 5]
squared = [n ** 2 for n in numbers]

print(greet("Student"))
print(f"Numbers: {numbers}")
print(f"Squared: {squared}")
print(f"Sum: {sum(squared)}")
`,
    snippets: [
      { label: "Hello World", code: 'print("Hello, World!")' },
      { label: "For Loop", code: 'for i in range(10):\n    print(f"Number: {i}")' },
      { label: "Function", code: 'def add(a, b):\n    return a + b\n\nresult = add(5, 3)\nprint(f"5 + 3 = {result}")' },
      { label: "List Comprehension", code: 'squares = [x**2 for x in range(1, 11)]\nprint(squares)' },
    ],
  },
  {
    id: "java",
    label: "Java",
    icon: "☕",
    monacoLang: "java",
    version: "OpenJDK 22",
    color: "#f59e0b",
    bgColor: "rgba(245, 158, 11, 0.1)",
    defaultCode: `// Java Virtual Lab
// Press Ctrl+Enter to run your code

public class Main {
    public static void greet(String name) {
        System.out.println("Hello, " + name + "! Welcome to the Virtual Lab.");
    }

    public static int factorial(int n) {
        if (n <= 1) return 1;
        return n * factorial(n - 1);
    }

    public static void main(String[] args) {
        greet("Student");

        // Array operations
        int[] numbers = {1, 2, 3, 4, 5};
        int sum = 0;
        for (int num : numbers) {
            sum += num;
        }
        System.out.println("Sum of array: " + sum);
        System.out.println("Factorial of 5: " + factorial(5));
    }
}
`,
    snippets: [
      { label: "Hello World", code: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}' },
      { label: "For Loop", code: 'public class Main {\n    public static void main(String[] args) {\n        for (int i = 0; i < 10; i++) {\n            System.out.println("Number: " + i);\n        }\n    }\n}' },
      { label: "Array", code: 'public class Main {\n    public static void main(String[] args) {\n        int[] arr = {5, 3, 8, 1, 9};\n        int max = arr[0];\n        for (int n : arr) if (n > max) max = n;\n        System.out.println("Max: " + max);\n    }\n}' },
    ],
  },
  {
    id: "c",
    label: "C",
    icon: "⚙️",
    monacoLang: "c",
    version: "GCC 13.2.0",
    color: "#8b5cf6",
    bgColor: "rgba(139, 92, 246, 0.1)",
    defaultCode: `// C Virtual Lab
// Press Ctrl+Enter to run your code

#include <stdio.h>
#include <string.h>

void greet(const char* name) {
    printf("Hello, %s! Welcome to the Virtual Lab.\\n", name);
}

int factorial(int n) {
    if (n <= 1) return 1;
    return n * factorial(n - 1);
}

int main() {
    greet("Student");

    // Array operations
    int numbers[] = {1, 2, 3, 4, 5};
    int sum = 0;
    int len = sizeof(numbers) / sizeof(numbers[0]);

    for (int i = 0; i < len; i++) {
        sum += numbers[i];
    }

    printf("Sum of array: %d\\n", sum);
    printf("Factorial of 5: %d\\n", factorial(5));

    return 0;
}
`,
    snippets: [
      { label: "Hello World", code: '#include <stdio.h>\n\nint main() {\n    printf("Hello, World!\\n");\n    return 0;\n}' },
      { label: "For Loop", code: '#include <stdio.h>\n\nint main() {\n    for (int i = 0; i < 10; i++) {\n        printf("Number: %d\\n", i);\n    }\n    return 0;\n}' },
      { label: "Pointer", code: '#include <stdio.h>\n\nint main() {\n    int x = 42;\n    int *ptr = &x;\n    printf("Value: %d\\n", *ptr);\n    printf("Address: %p\\n", ptr);\n    return 0;\n}' },
      { label: "Struct", code: '#include <stdio.h>\n\nstruct Student {\n    char name[50];\n    int age;\n};\n\nint main() {\n    struct Student s = {"Alice", 20};\n    printf("Name: %s, Age: %d\\n", s.name, s.age);\n    return 0;\n}' },
    ],
  },
];

export default function VirtualLabPage() {
  const [selectedLang, setSelectedLang] = useState(LANGUAGES[0]);
  const [code, setCode] = useState(LANGUAGES[0].defaultCode);
  const [output, setOutput] = useState(null); // null = idle, { text, type: 'success'|'error'|'warning' }
  const [isRunning, setIsRunning] = useState(false);
  const [copied, setCopied] = useState(false);
  const [execTime, setExecTime] = useState(null);
  const [showSnippets, setShowSnippets] = useState(false);
  const [langDropdown, setLangDropdown] = useState(false);

  const handleLanguageChange = (lang) => {
    setSelectedLang(lang);
    setCode(lang.defaultCode);
    setOutput(null);
    setExecTime(null);
    setLangDropdown(false);
    setShowSnippets(false);
  };

  const handleRunCode = useCallback(async () => {
    if (isRunning) return;
    setIsRunning(true);
    setOutput(null);
    setExecTime(null);

    const startTime = Date.now();

    try {
      const response = await fetch("/api/code-execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language: selectedLang.id, code }),
      });

      const data = await response.json();
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
      setExecTime(elapsed);

      if (!response.ok || data.error) {
        setOutput({ text: data.error || "Execution failed", type: "error" });
      } else if (data.output) {
        setOutput({
          text: data.output,
          type: "success",
          warnings: data.warnings,
        });
      } else {
        setOutput({ text: "Program executed with no output.", type: "success" });
      }
    } catch (err) {
      setOutput({ text: "Network error: Unable to reach the execution server.", type: "error" });
    } finally {
      setIsRunning(false);
    }
  }, [isRunning, selectedLang, code]);

  const handleReset = () => {
    setCode(selectedLang.defaultCode);
    setOutput(null);
    setExecTime(null);
  };

  const handleCopyOutput = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSnippet = (snippet) => {
    setCode(snippet.code);
    setOutput(null);
    setShowSnippets(false);
  };

  const handleEditorMount = (editor) => {
    editor.addCommand(
      // Ctrl+Enter to run
      monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter,
      handleRunCode
    );
  };

  return (
    <div className="virtual-lab-root">
      <style>{`
        .virtual-lab-root {
          font-family: 'Inter', system-ui, sans-serif;
          background: #0f1117;
          min-height: 100vh;
          margin: -2rem; /* Negate the 2rem padding of the dashboard-main container */
          color: #e2e8f0;
          display: flex;
          flex-direction: column;
          gap: 0;
        }

        /* Header */
        .vl-header {
          background: linear-gradient(135deg, #1a1f2e 0%, #16213e 100%);
          border-bottom: 1px solid rgba(255,255,255,0.08);
          padding: 16px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
        }
        .vl-header-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .vl-title-icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          box-shadow: 0 0 20px rgba(99, 102, 241, 0.4);
        }
        .vl-title {
          font-size: 22px;
          font-weight: 700;
          background: linear-gradient(135deg, #e2e8f0, #a5b4fc);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          line-height: 1.2;
        }
        .vl-subtitle {
          font-size: 12px;
          color: #64748b;
          margin-top: 2px;
        }

        /* Language Selector */
        .lang-selector {
          display: flex;
          gap: 8px;
          align-items: center;
        }
        .lang-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.05);
          color: #94a3b8;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s;
        }
        .lang-btn:hover {
          border-color: rgba(255,255,255,0.2);
          background: rgba(255,255,255,0.08);
          color: #e2e8f0;
        }
        .lang-btn.active {
          border-color: var(--lang-color);
          background: var(--lang-bg);
          color: #e2e8f0;
          box-shadow: 0 0 12px rgba(var(--lang-shadow), 0.3);
        }
        .lang-icon {
          font-size: 16px;
        }

        /* Toolbar */
        .vl-toolbar {
          background: #13172580;
          backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(255,255,255,0.06);
          padding: 10px 24px;
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }
        .toolbar-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 7px 14px;
          border-radius: 7px;
          border: 1px solid transparent;
          cursor: pointer;
          font-size: 13px;
          font-weight: 500;
          transition: all 0.2s;
          white-space: nowrap;
        }
        .btn-run {
          background: linear-gradient(135deg, #22c55e, #16a34a);
          color: white;
          border-color: rgba(34, 197, 94, 0.4);
          box-shadow: 0 2px 12px rgba(34, 197, 94, 0.25);
        }
        .btn-run:hover:not(:disabled) {
          background: linear-gradient(135deg, #16a34a, #15803d);
          box-shadow: 0 4px 20px rgba(34, 197, 94, 0.4);
          transform: translateY(-1px);
        }
        .btn-run:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }
        .btn-reset {
          background: rgba(255,255,255,0.05);
          color: #94a3b8;
          border-color: rgba(255,255,255,0.08);
        }
        .btn-reset:hover {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
          border-color: rgba(239, 68, 68, 0.3);
        }
        .btn-snippets {
          background: rgba(255,255,255,0.05);
          color: #94a3b8;
          border-color: rgba(255,255,255,0.08);
          position: relative;
        }
        .btn-snippets:hover {
          background: rgba(99, 102, 241, 0.1);
          color: #a5b4fc;
          border-color: rgba(99, 102, 241, 0.3);
        }
        .toolbar-spacer { flex: 1; }
        .kbd-hint {
          font-size: 11px;
          color: #475569;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        kbd {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 4px;
          padding: 2px 6px;
          font-family: monospace;
          font-size: 11px;
        }

        /* Snippets Dropdown */
        .snippets-dropdown {
          position: absolute;
          top: calc(100% + 8px);
          left: 0;
          z-index: 100;
          background: #1e2435;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px;
          padding: 8px;
          min-width: 200px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.4);
        }
        .snippet-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          border-radius: 6px;
          cursor: pointer;
          color: #94a3b8;
          font-size: 13px;
          transition: all 0.15s;
        }
        .snippet-item:hover {
          background: rgba(99, 102, 241, 0.15);
          color: #a5b4fc;
        }

        /* Main Layout */
        .vl-main {
          display: grid;
          grid-template-columns: 1fr 1fr;
          flex: 1;
          min-height: 0;
        }
        @media (max-width: 900px) {
          .vl-main {
            grid-template-columns: 1fr;
          }
        }

        /* Editor Panel */
        .editor-panel {
          border-right: 1px solid rgba(255,255,255,0.06);
          display: flex;
          flex-direction: column;
        }
        .panel-header {
          padding: 10px 16px;
          background: #13172580;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          font-weight: 600;
          color: #64748b;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }
        .panel-header-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--lang-color, #6366f1);
          box-shadow: 0 0 6px var(--lang-color, #6366f1);
        }
        .editor-wrapper {
          flex: 1;
          min-height: 480px;
        }

        /* Output Panel */
        .output-panel {
          display: flex;
          flex-direction: column;
          background: #0a0d14;
        }
        .output-header {
          padding: 10px 16px;
          background: #13172580;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .output-header-left {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          font-weight: 600;
          color: #64748b;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }
        .terminal-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #22c55e;
          box-shadow: 0 0 6px #22c55e;
        }
        .copy-btn {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 4px 10px;
          border-radius: 6px;
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.03);
          color: #64748b;
          cursor: pointer;
          font-size: 12px;
          transition: all 0.2s;
        }
        .copy-btn:hover {
          background: rgba(255,255,255,0.08);
          color: #94a3b8;
        }
        .output-content {
          flex: 1;
          padding: 20px;
          font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
          font-size: 13px;
          line-height: 1.7;
          overflow: auto;
          min-height: 480px;
        }
        .output-idle {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          min-height: 400px;
          color: #2d3748;
          text-align: center;
          gap: 12px;
        }
        .output-idle-icon {
          font-size: 48px;
          opacity: 0.4;
        }
        .output-idle-text {
          font-size: 14px;
          color: #374151;
        }
        .output-running {
          display: flex;
          align-items: center;
          gap: 12px;
          color: #64748b;
          font-size: 14px;
        }
        .spinner {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(99, 102, 241, 0.2);
          border-top-color: #6366f1;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .output-success { color: #4ade80; }
        .output-error { color: #f87171; }
        .output-warnings {
          margin-top: 16px;
          padding: 10px 14px;
          background: rgba(245, 158, 11, 0.08);
          border: 1px solid rgba(245, 158, 11, 0.2);
          border-radius: 6px;
          color: #fbbf24;
          font-size: 12px;
        }
        .output-meta {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          color: #374151;
          margin-bottom: 12px;
          padding-bottom: 12px;
          border-bottom: 1px solid rgba(255,255,255,0.04);
        }
        pre { margin: 0; white-space: pre-wrap; word-break: break-word; }

        /* Status Bar */
        .status-bar {
          background: #0d1117;
          border-top: 1px solid rgba(255,255,255,0.04);
          padding: 6px 24px;
          display: flex;
          align-items: center;
          gap: 20px;
          font-size: 11px;
          color: #374151;
        }
        .status-item {
          display: flex;
          align-items: center;
          gap: 5px;
        }
        .status-ready { color: #22c55e; }
        .status-running { color: #6366f1; }

        /* Info Cards Row */
        .info-row {
          display: flex;
          gap: 12px;
          padding: 12px 24px;
          background: #0d1117;
          border-top: 1px solid rgba(255,255,255,0.04);
          flex-wrap: wrap;
        }
        .info-card {
          flex: 1;
          min-width: 180px;
          background: #13172580;
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 8px;
          padding: 10px 14px;
          display: flex;
          align-items: flex-start;
          gap: 10px;
        }
        .info-card-icon {
          font-size: 18px;
          margin-top: 2px;
        }
        .info-card-title {
          font-size: 11px;
          font-weight: 600;
          color: #475569;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 3px;
        }
        .info-card-text {
          font-size: 12px;
          color: #64748b;
          line-height: 1.5;
        }

        /* Loading dots */
        .dots::after {
          content: '';
          animation: dots 1.5s infinite;
        }
        @keyframes dots {
          0% { content: ''; }
          33% { content: '.'; }
          66% { content: '..'; }
          100% { content: '...'; }
        }
      `}</style>

      {/* Header */}
      <div className="vl-header">
        <div className="vl-header-left">
          <div className="vl-title-icon">⚗️</div>
          <div>
            <div className="vl-title">Virtual Lab</div>
            <div className="vl-subtitle">Online Code Editor & Executor</div>
          </div>
        </div>
        <div className="lang-selector">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.id}
              className={`lang-btn ${selectedLang.id === lang.id ? "active" : ""}`}
              style={{
                "--lang-color": lang.color,
                "--lang-bg": lang.bgColor,
              }}
              onClick={() => handleLanguageChange(lang)}
            >
              <span className="lang-icon">{lang.icon}</span>
              {lang.label}
            </button>
          ))}
        </div>
      </div>

      {/* Toolbar */}
      <div className="vl-toolbar">
        <button
          className="toolbar-btn btn-run"
          onClick={handleRunCode}
          disabled={isRunning}
        >
          {isRunning ? (
            <>
              <div className="spinner" style={{ width: 14, height: 14 }} />
              Running<span className="dots" />
            </>
          ) : (
            <>
              <Play size={14} />
              Run Code
            </>
          )}
        </button>

        <button className="toolbar-btn btn-reset" onClick={handleReset}>
          <Trash2 size={14} />
          Reset
        </button>

        <div style={{ position: "relative" }}>
          <button
            className="toolbar-btn btn-snippets"
            onClick={() => setShowSnippets(!showSnippets)}
          >
            <BookOpen size={14} />
            Snippets
            <ChevronDown size={12} />
          </button>
          {showSnippets && (
            <div className="snippets-dropdown">
              {selectedLang.snippets.map((s, i) => (
                <div key={i} className="snippet-item" onClick={() => handleSnippet(s)}>
                  <Code2 size={13} />
                  {s.label}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="toolbar-spacer" />

        <div className="kbd-hint">
          <Zap size={12} style={{ color: "#6366f1" }} />
          Run with <kbd>Ctrl</kbd>+<kbd>Enter</kbd>
        </div>
      </div>

      {/* Main Editor + Output */}
      <div className="vl-main" style={{ flex: 1 }}>
        {/* Editor */}
        <div className="editor-panel">
          <div className="panel-header" style={{ "--lang-color": selectedLang.color }}>
            <div className="panel-header-dot" />
            {selectedLang.icon} {selectedLang.label} Editor
            <span style={{ marginLeft: "auto", fontWeight: 400 }}>v{selectedLang.version}</span>
          </div>
          <div className="editor-wrapper">
            <MonacoEditor
              height="100%"
              language={selectedLang.monacoLang}
              value={code}
              onChange={(val) => setCode(val || "")}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
                wordWrap: "on",
                automaticLayout: true,
                scrollBeyondLastLine: false,
                tabSize: 4,
                lineNumbers: "on",
                renderLineHighlight: "line",
                cursorBlinking: "smooth",
                smoothScrolling: true,
                padding: { top: 16, bottom: 16 },
              }}
              onMount={(editor) => {
                editor.addCommand(
                  // Ctrl+Enter shortcut
                  2048 | 3, // CtrlCmd | Enter
                  handleRunCode
                );
              }}
            />
          </div>
        </div>

        {/* Output */}
        <div className="output-panel">
          <div className="output-header">
            <div className="output-header-left">
              <div className="terminal-dot" />
              <Terminal size={12} />
              Terminal Output
            </div>
            {output && (
              <button className="copy-btn" onClick={handleCopyOutput}>
                {copied ? <Check size={12} /> : <Copy size={12} />}
                {copied ? "Copied!" : "Copy"}
              </button>
            )}
          </div>
          <div className="output-content">
            {!output && !isRunning && (
              <div className="output-idle">
                <div className="output-idle-icon">
                  <Terminal size={48} strokeWidth={1} />
                </div>
                <div className="output-idle-text">
                  Click <strong>Run Code</strong> or press <strong>Ctrl+Enter</strong> to execute
                </div>
              </div>
            )}

            {isRunning && (
              <div className="output-running">
                <div className="spinner" />
                Compiling and executing your code<span className="dots" />
              </div>
            )}

            {output && !isRunning && (
              <>
                {execTime && (
                  <div className="output-meta">
                    <Clock size={11} />
                    Executed in {execTime}s &nbsp;·&nbsp;
                    {selectedLang.icon} {selectedLang.label} {selectedLang.version}
                    &nbsp;·&nbsp;
                    <span style={{ color: output.type === "success" ? "#22c55e" : "#ef4444" }}>
                      {output.type === "success" ? "✓ Success" : "✗ Failed"}
                    </span>
                  </div>
                )}

                {output.type === "error" ? (
                  <pre className="output-error">{output.text}</pre>
                ) : (
                  <pre className="output-success">{output.text}</pre>
                )}

                {output.warnings && (
                  <div className="output-warnings">
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                      <AlertTriangle size={13} />
                      <strong>Warnings</strong>
                    </div>
                    <pre style={{ margin: 0, whiteSpace: "pre-wrap", color: "#fbbf24" }}>{output.warnings}</pre>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Info Row */}
      <div className="info-row">
        <div className="info-card">
          <div className="info-card-icon">🐍</div>
          <div>
            <div className="info-card-title">Python</div>
            <div className="info-card-text">Python 3.10 · High-level, versatile scripting</div>
          </div>
        </div>
        <div className="info-card">
          <div className="info-card-icon">☕</div>
          <div>
            <div className="info-card-title">Java</div>
            <div className="info-card-text">Java 15 · OOP, platform-independent</div>
          </div>
        </div>
        <div className="info-card">
          <div className="info-card-icon">⚙️</div>
          <div>
            <div className="info-card-title">C</div>
            <div className="info-card-text">C (GCC 10.2) · Systems, performance-critical</div>
          </div>
        </div>
        <div className="info-card">
          <div className="info-card-icon">ℹ️</div>
          <div>
            <div className="info-card-title">Tip</div>
            <div className="info-card-text">Use Snippets for quick starter code templates</div>
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="status-bar">
        <div className="status-item">
          <span className={isRunning ? "status-running" : "status-ready"}>●</span>
          {isRunning ? "Running..." : "Ready"}
        </div>
        <div className="status-item">
          {selectedLang.icon} {selectedLang.label}
        </div>
        {execTime && (
          <div className="status-item">
            <Clock size={11} /> Last run: {execTime}s
          </div>
        )}
        <div style={{ marginLeft: "auto" }}>
          Powered by Piston API
        </div>
      </div>
    </div>
  );
}
