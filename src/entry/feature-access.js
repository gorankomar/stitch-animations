import '../animations/access/styles.css';
import { init } from '../animations/access/index.js';

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => init(document), { once: true });
} else {
  init(document);
}
