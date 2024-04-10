import { html, LitElement } from 'lit';
import pillarbox from '@srgssr/pillarbox-web';

/**
 * `PreviewBox` is a LitElement component that creates a pillarbox player
 * with specific styling and functionalities, including the ability to apply
 * custom CSS.
 *
 * @element preview-box
 *
 * @property {String} appliedCss CSS styles that can be applied to the video player.
 * @property {String} [src='urn:rts:video:14318206'] The media to be loaded by the player,
 * @property {String} [type='srgssr/urn'] The type of media to be loaded.
 *
 * @example
 * <preview-box></preview-box>
 */
class PreviewBox extends LitElement {
  static properties = {
    appliedCss: { type: String },
    src: { type: String },
    type: { type: String }
  };

  constructor() {
    super();
    this.src = 'urn:rts:video:14318206';
    this.type = 'srgssr/urn';
  }

  render() {
    return html`
      <style>${this.appliedCss}</style>
      <video id="preview-player"
             class="pillarbox-js"
             controls crossOrigin="anonymous">
      </video>
    `;
  }

  updated(_changedProperties) {
    super.firstUpdated(_changedProperties);

    if (['src', 'type'].some(property => _changedProperties.has(property))) {
      this.player?.dispose();

      const el = this.shadowRoot.getElementById('preview-player');

      this.player = pillarbox(el, {
        muted: true,
        restoreEl: true
      });

      this.player.src({
        src: this.src,
        type: this.type,
        disableTrackers: true
      });
    }
  }
}

customElements.define('preview-box', PreviewBox);
