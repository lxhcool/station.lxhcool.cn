import { WidgetStrategy } from '../types/widget';

class WidgetRegistryService {
  private strategies = new Map<string, WidgetStrategy>();

  register(strategy: WidgetStrategy) {
    this.strategies.set(strategy.type, strategy);
  }

  get(type: string): WidgetStrategy | undefined {
    return this.strategies.get(type);
  }

  getAll(): WidgetStrategy[] {
    return Array.from(this.strategies.values());
  }
}

export const widgetRegistry = new WidgetRegistryService();
