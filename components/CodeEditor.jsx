"use client";
import Editor from "@monaco-editor/react";
export default function CodeEditor({ language, value, onChange, height = "500px", theme = "vs-dark" }) {
    return (<Editor height={height} language={language} value={value} onChange={(value) => onChange(value || "")} theme={theme} options={{
            minimap: { enabled: false },
            fontSize: 14,
            wordWrap: "on",
            automaticLayout: true,
            scrollBeyondLastLine: false,
            tabSize: 4,
        }}/>);
}
