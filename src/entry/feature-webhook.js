import '../animations/webhook/styles.css';
import { init } from '../animations/webhook/index.js';

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => init(document), { once: true });
} else {
  init(document);
}
