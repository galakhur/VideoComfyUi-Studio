"use client";

import { useParams } from "next/navigation";
import { Film, Scissors, Wand2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/Header";

export default function ExportPage() {
  const params = useParams();

  return (
    <div className="flex flex-col h-screen">
      <Header title="Video Export" />

      <div className="flex-1 overflow-y-auto p-6">
        <Tabs defaultValue="stitch" className="mx-auto max-w-4xl">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="stitch" className="gap-2">
              <Film className="h-4 w-4" />
              Simple Stitch
            </TabsTrigger>
            <TabsTrigger value="smart" className="gap-2">
              <Wand2 className="h-4 w-4" />
              Smart Edit
            </TabsTrigger>
            <TabsTrigger value="remotion" className="gap-2">
              <Scissors className="h-4 w-4" />
              Remotion
            </TabsTrigger>
          </TabsList>

          <TabsContent value="stitch">
            <Card>
              <CardHeader>
                <CardTitle>Simple Stitch</CardTitle>
                <CardDescription>
                  Concatenate all final scene videos into a single video file.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  This mode simply joins all scene videos in order. No transitions or effects.
                </p>
                <Button disabled>
                  <Film className="mr-2 h-4 w-4" />
                  Export Video (requires final scenes)
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="smart">
            <Card>
              <CardHeader>
                <CardTitle>Smart Edit</CardTitle>
                <CardDescription>
                  AI-driven video editing with automatic transitions and pacing.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Smart Edit analyzes scene content and automatically adds transitions,
                  adjusts timing, and optimizes the final cut.
                </p>
                <Button disabled>
                  <Wand2 className="mr-2 h-4 w-4" />
                  Smart Export (coming soon)
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="remotion">
            <Card>
              <CardHeader>
                <CardTitle>Remotion Export</CardTitle>
                <CardDescription>
                  Professional video composition with Remotion framework.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Full control over timeline, transitions, audio tracks, and effects
                  using the Remotion composition engine.
                </p>
                <Button disabled>
                  <Scissors className="mr-2 h-4 w-4" />
                  Remotion Export (coming soon)
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
