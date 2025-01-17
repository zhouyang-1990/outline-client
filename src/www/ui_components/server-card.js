/*
  Copyright 2020 The Outline Authors

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/

import './server-connection-viz.js';

import {Polymer} from '@polymer/polymer/lib/legacy/polymer-fn.js';
import {html} from '@polymer/polymer/lib/utils/html-tag.js';

Polymer({
  _template: html`
    <style>
      :host {
        display: block;
      }

      :focus {
        /* Disable outline for focused elements; mainly affects the iOS WebView,
         * where elements stay highlighted after user interaction.
         */
        outline: 0 !important;
      }

      paper-card {
        width: 100%;
      }

      paper-menu-button {
        color: #5f6368;
      }

      paper-item {
        white-space: nowrap;
      }

      paper-item:not([disabled]) {
        cursor: pointer;
      }

      .card-header {
        display: flex;
      }

      .card-content {
        text-align: center;
        padding: 10% 0;
      }

      .card-header server-connection-viz {
        padding: 16px 0 0 16px;
      }

      #serverInfo {
        flex: 1;
        padding: 16px 0 0 16px;
        font-size: 20px;
        /* Make the sever name and address copyable */
        -webkit-user-select: text; /* Safari */
        -ms-user-select: text; /* IE/Edge */
        user-select: text; /* Chrome */
      }

      #serverName {
        line-height: 32px;
        word-break: break-word;
      }

      #serverAddress {
        color: rgba(0, 0, 0, 0.54);
        font-size: small;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      #server-visualization-button {
        background: none;
        border-radius: 100px;
        margin: 0;
        padding: 3px 3px 0;
      }

      .status-message {
        color: var(--disabled-text-color);
        font-size: small;
        font-weight: normal;
        margin: 12px 0;
        text-transform: capitalize;
      }

      .card-actions {
        display: flex;
        align-items: center;
        border-radius: 0 0 2px 2px;
        border-top: none;
      }

      .expanded .card-actions {
        background-color: var(--paper-grey-50);
        border-top: 1px solid #e8e8e8;
      }

      #connectButton {
        color: #2fbea5;
        font-weight: bold;
      }

      #connectButton[disabled] {
        color: var(--disabled-text-color);
        background: transparent;
      }

      #errorMessage {
        color: #f44336;
        margin-right: auto;
      }

      @media (max-width: 360px) {
        #serverInfo {
          font-size: 18px;
        }
        #serverName {
          line-height: 24px;
        }
      }

      @media (min-height: 600px) {
        .card-content {
          padding: 20% 0;
        }
      }
    </style>

    <paper-card class\$="[[_computeExpandedClassName(expanded)]]">
      <div class="card-header">
        <server-connection-viz state="[[state]]" root-path="[[rootPath]]" hidden\$="[[expanded]]"></server-connection-viz>
        <div id="serverInfo">
          <div id="serverName">[[serverName]]</div>
          <div id="serverAddress">[[serverAddress]]</div>
        </div>
        <paper-menu-button horizontal-align="right" close-on-activate="true">
          <paper-icon-button icon="icons:more-vert" slot="dropdown-trigger"></paper-icon-button>
          <paper-listbox id="menu" slot="dropdown-content" on-iron-activate="_onMenuItemPressed" attr-for-selected="name">
            <paper-item name="rename">[[localize('server-rename')]]</paper-item>
            <paper-item name="forget">[[localize('server-forget')]]</paper-item>
          </paper-listbox>
        </paper-menu-button>
      </div>
      <div class="card-content" hidden\$="[[!expanded]]">
        <div>
          <paper-button id="server-visualization-button" on-tap="_onConnectToggled" disabled\$="[[connectButtonDisabled]]" noink="">
            <server-connection-viz state="[[state]]" root-path="[[rootPath]]" expanded=""></server-connection-viz>
          </paper-button>
        </div>
        <div class\$="status-message [[state]]">[[statusMessage]]</div>
      </div>
      <div class="card-actions">
        <div id="errorMessage">[[errorMessage]]</div>
        <paper-button id="connectButton" on-tap="_onConnectToggled" disabled\$="[[connectButtonDisabled]]">[[connectButtonLabel]]</paper-button>
      </div>
    </paper-card>
`,

  is: 'server-card',

  properties: {
    // Need to declare localize function passed in from parent, or else
    // localize() calls within the template won't be updated.
    expanded: {type: Boolean, value: false},
    errorMessage: String,
    disabled: Boolean,
    localize: Function,
    rootPath: String,
    serverName: String,
    serverId: String,
    serverAddress: String,
    state: {
      type: String,
      value: 'DISCONNECTED',
    },
    statusMessage: {
      type: String,
      computed: '_computeStatusMessage(state, localize)',
    },
    connectButtonLabel: {
      type: String,
      computed: '_computeConnectButtonLabel(state, localize)',
    },
    connectButtonDisabled: {
      type: Boolean,
      computed: '_computeConnectButtonDisabled(state)',
    },
  },

  _onConnectToggled: function() {
    var connect = this.state === 'DISCONNECTED';
    var eventId = (connect ? 'C' : 'Disc') + 'onnectPressed';
    this.fire(eventId, {serverId: this.serverId});
  },

  _computeStatusMessage: function(state, localize) {
    // If localize hasn't been defined yet, just return '' for now - Polymer will call this
    // again once localize has been defined at which point we will return the right value.
    if (!localize) return '';
    return (
        {
          DISCONNECTED: this.localize('disconnected-server-state'),
          CONNECTING: this.localize('connecting-server-state'),
          CONNECTED: this.localize('connected-server-state'),
          DISCONNECTING: this.localize('disconnecting-server-state'),
          RECONNECTING: this.localize('reconnecting-server-state'),
        }[state] ||
        this.localize('disconnected-server-state'));
  },

  _computeConnectButtonLabel: function(state, localize) {
    if (!localize) return '';
    return (
        {
          DISCONNECTED: this.localize('connect-button-label'),
          CONNECTING: this.localize('disconnect-button-label'),
          CONNECTED: this.localize('disconnect-button-label'),
          DISCONNECTING: this.localize('connect-button-label'),
          RECONNECTING: this.localize('disconnect-button-label'),
        }[state] ||
        this.localize('connect-button-label'));
  },

  _computeConnectButtonDisabled: function(state) {
    return this.disabled || state === 'CONNECTING' || state === 'DISCONNECTING';
  },

  _computeExpandedClassName: function(expanded) {
    return expanded ? 'expanded' : '';
  },

  _onMenuItemPressed: function(evt, detail) {
    if (detail.selected === 'forget') {
      this._fireForgetRequest();
    } else if (detail.selected === 'rename') {
      this._fireShowServerRename();
    }
    // This can leave the pressed paper-item in the selected state,
    // causing it to get selected styling (e.g. font-weight: bold),
    // so explicitly deselect it:
    this.async(function() {
      this.$.menu.select(null);
    });
  },

  _fireForgetRequest: function() {
    this.fire('ForgetPressed', {serverId: this.serverId});
  },

  _fireShowServerRename: function() {
    this.fire('ShowServerRename', {serverName: this.serverName, serverId: this.serverId});
  }
});
