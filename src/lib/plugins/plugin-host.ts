import type { PluginDefinition, HookContext, PluginEvent } from "./plugin-sdk";

class PluginHost {
  private plugins: Map<string, PluginDefinition> = new Map();

  register(plugin: PluginDefinition): void {
    this.plugins.set(plugin.name, plugin);
  }

  unregister(name: string): void {
    this.plugins.delete(name);
  }

  getPlugin(name: string): PluginDefinition | undefined {
    return this.plugins.get(name);
  }

  getAllPlugins(): PluginDefinition[] {
    return Array.from(this.plugins.values());
  }

  async executeHooks(event: PluginEvent, data: Record<string, unknown>): Promise<void> {
    const context: HookContext = { event, data };

    // Collect all hooks for this event, sorted by priority
    const hooks: { plugin: string; handler: (ctx: HookContext) => Promise<void>; priority: number }[] = [];

    for (const [name, plugin] of this.plugins) {
      if (plugin.hooks) {
        for (const hook of plugin.hooks) {
          if (hook.event === event) {
            hooks.push({
              plugin: name,
              handler: hook.handler,
              priority: hook.priority ?? 0,
            });
          }
        }
      }
    }

    hooks.sort((a, b) => a.priority - b.priority);

    for (const hook of hooks) {
      try {
        await hook.handler(context);
      } catch (error) {
        console.error(`Plugin hook error [${hook.plugin}:${event}]:`, error);
      }
    }
  }
}

export const pluginHost = new PluginHost();
