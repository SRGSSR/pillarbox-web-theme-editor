import { css, html, LitElement } from 'lit';
import pillarbox from '@srgssr/pillarbox-web';

/**
 * `PreviewBox` is a LitElement component that creates a pillarbox player
 * with specific styling and functionalities, including the ability to apply
 * custom CSS.
 *
 * @element preview-box
 *
 * @property {String} appliedCss CSS styles that can be applied to the video player.
 * @property {String} [src='urn:swi:video:49122298'] The media to be loaded by the player,
 * @property {String} [type='srgssr/urn'] The type of media to be loaded.
 *
 * @example
 * <preview-box></preview-box>
 */
class PreviewBox extends LitElement {
  static properties = {
    appliedCss: { type: String },
    mediaSrc: { type: String },
    type: { type: String }
  };

  static styles = css`
    .player-container {
      width: 100%;
      height: 100%;
    }
  `;

  constructor() {
    super();
    this.mediaSrc = 'urn:swi:video:49122298';
    this.type = 'srgssr/urn';
  }

  render() {
    // TODO Remove the player container once this is resolved: https://github.com/videojs/video.js/pull/8679
    return html`
      <style>${this.appliedCss}</style>
      <div class="player-container">
        <video id="preview-player"
               class="pillarbox-js"
               controls crossOrigin="anonymous">
        </video>
      </div>
    `;
  }

  updated(_changedProperties) {
    super.firstUpdated(_changedProperties);

    if (['mediaSrc', 'type'].some(property => _changedProperties.has(property))) {
      this.player?.dispose();

      const el = this.shadowRoot.getElementById('preview-player');

      this.player = pillarbox(el, {
        muted: true,
        restoreEl: true
      });

      this.player.src({
        src: this.mediaSrc,
        type: this.type,
        disableTrackers: true
      });
    }
  }
}

customElements.define('preview-box', PreviewBox);
