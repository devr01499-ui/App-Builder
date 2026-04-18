"use client";

import { Sandpack } from "@codesandbox/sandpack-react";

interface SandpackPreviewProps {
  code: string;
}

const tailwindHtmlContent = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>AI Preview</title>
    <script src="https://cdn.tailwindcss.com"></script>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`;

export function SandpackPreview({ code }: SandpackPreviewProps) {
  return (
    <div className="w-full h-full rounded-2xl overflow-hidden border border-slate-700/50 shadow-2xl">
      <Sandpack
        template="react-ts"
        theme="dark"
        customSetup={{
          dependencies: {
            "lucide-react": "latest",
          },
        }}
        files={{
          "/App.tsx": code,
          "/public/index.html": tailwindHtmlContent,
        }}
        options={{
          showNavigator: true,
          showLineNumbers: true,
          showTabs: true,
          editorHeight: "calc(100vh - 200px)",
          wrapContent: true,
        }}
      />
    </div>
  );
}
