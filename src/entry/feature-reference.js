import '../animations/reference/styles.css';
import { init } from '../animations/reference/index.js';

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => init(document), { once: true });
} else {
  init(document);
}
