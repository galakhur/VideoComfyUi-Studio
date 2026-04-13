"use client";

import { Puzzle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function McpExtensionsPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <Puzzle className="h-6 w-6" />
          MCP Extensions
        </h1>
        <p className="text-sm text-muted-foreground">
          Connect external AI tools via Model Context Protocol
        </p>
      </div>

      <div className="mx-auto max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>MCP Tools</CardTitle>
            <CardDescription>
              MCP adapter allows external agents and tools to interact with Muse Studio.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center py-8 text-center">
              <Puzzle className="mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                MCP integration coming soon. This will enable external AI tools to
                read projects, generate stories, create images, and more.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
