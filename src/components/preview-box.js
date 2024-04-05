import { html, LitElement } from 'lit';
import { createRef, ref } from 'lit/directives/ref.js';
import pillarbox from '@srgssr/pillarbox-web';

/**
 * `PreviewBox` is a LitElement component that creates a pillarbox player
 * with specific styling and functionalities, including the ability to apply
 * custom CSS.
 *
 * @element preview-box
 *
 * @property {String} appliedCss CSS styles that can be applied to the video player.
 *
 * @example
 * <preview-box></preview-box>
 */
class PreviewBox extends LitElement {
  static properties = {
    appliedCss: { type: String }
  };

  constructor() {
    super();
    this.pillarboxRef = createRef();
  }

  /**
   * Renders the video player with applied custom CSS and the pillarbox library functionalities.
   *
   * @returns {TemplateResult} The LitElement `html` template result.
   */
  render() {
    return html`
      <style>${this.appliedCss}</style>
      <video id="main-player"
             class="pillarbox-js"
             controls crossOrigin="anonymous"
             ${ref(this.pillarboxRef)}>
      </video>
    `;
  }

  /**
   * Lifecycle callback that is called after the component's first render.
   * It initializes the pillarbox player with a specific video source.
   */
  firstUpdated(_changedProperties) {
    super.firstUpdated(_changedProperties);

    // Initializes pillarbox with the video element and sets the video source.
    this.player = pillarbox(this.pillarboxRef.value, { muted: true });
    this.player.src({
      src: 'urn:rts:video:14318206',
      type: 'srgssr/urn'
    });
  }
}

customElements.define('preview-box', PreviewBox);
