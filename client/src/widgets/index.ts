import { widgetRegistry } from '../services/widgetRegistry';
import { bookmarkStrategy } from './bookmark';
import { weatherStrategy } from './weather';
import { calendarStrategy } from './calendar';
import { hotboardStrategy } from './hotboard';
import { noteStrategy } from './note';
import { countdownStrategy } from './countdown';
import { quoteStrategy } from './quote';
import { githubStrategy } from './github';
import { playerStrategy } from './player';

export function initializeWidgets() {
  widgetRegistry.register(bookmarkStrategy);
  widgetRegistry.register(weatherStrategy);
  widgetRegistry.register(calendarStrategy);
  widgetRegistry.register(hotboardStrategy);
  widgetRegistry.register(noteStrategy);
  widgetRegistry.register(countdownStrategy);
  widgetRegistry.register(quoteStrategy);
  widgetRegistry.register(githubStrategy);
  widgetRegistry.register(playerStrategy);
}

export * from './bookmark';
export * from './weather';
export * from './calendar';
export * from './hotboard';
export * from './note';
export * from './countdown';
export * from './quote';
export * from './github';
export * from './player';
