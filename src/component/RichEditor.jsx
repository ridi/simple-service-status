/**
 * Rich WYSIWYG Editor
 *
 * @author kyungmi.k
 * @since 1.0.0
 */

import React from 'react';
import PropTypes from 'prop-types';
import Draft from 'draft-js';
import { stateToHTML } from 'draft-js-export-html';
import config from '../config/client.config';

import {
  Button,
  ButtonToolbar,
  ButtonGroup,
} from 'react-bootstrap';

const Editor = Draft.Editor;
const EditorState = Draft.EditorState;
const ContentState = Draft.ContentState;
const RichUtils = Draft.RichUtils;

const DEFAULT_BUTTON = Object.freeze({
  BOLD: false,
  ITALIC: false,
  UNDERLINE: false,
  STRIKETHROUGH: false,
  'unordered-list-item': false,
  'ordered-list-item': false,
});

export default class RichEditor extends React.Component {
  constructor(props) {
    super(props);
    let editorState;
    if (props.value) {
      const blocks = Draft.convertFromHTML(props.value);
      const contentState = ContentState.createFromBlockArray(blocks.contentBlocks, blocks.entityMap);
      editorState = EditorState.createWithContent(contentState);
    } else {
      editorState = EditorState.createEmpty();
    }
    this.state = {
      editorState,
      buttons: DEFAULT_BUTTON,
    };

    this.onToggleBlockType = blockType => this.onChange(RichUtils.toggleBlockType(this.state.editorState, blockType));
    this.onToggleInlineStyle = inlineStyle => this.onChange(RichUtils.toggleInlineStyle(this.state.editorState, inlineStyle));

    this.onTab = (e) => {
      const maxDepth = 4;
      this.onChange(RichUtils.onTab(e, this.state.editorState, maxDepth));
    };
  }

  onChange(editorState) {
    this.setState({ editorState });
    this.changeButtonState(this.getCurrent(editorState));
    // TODO remove replace(/\n/g, '') after this PR(sstur/draft-js-export-html#66) is merged
    this.props.onChange(stateToHTML(editorState.getCurrentContent(), { prettyPrint: false }).replace(/\n/g, ''));
  }

  getCurrent(editorState) {
    const selection = editorState.getSelection();
    const blockType = editorState
      .getCurrentContent()
      .getBlockForKey(selection.getStartKey())
      .getType();
    const inlineStyles = editorState.getCurrentInlineStyle().toArray();
    return [].concat(blockType, inlineStyles);
  }

  changeButtonState(current) {
    const newButtons = Object.assign({}, DEFAULT_BUTTON);
    current.forEach((c) => { newButtons[c] = true; });
    this.setState({ buttons: newButtons });
  }

  setContent(html) {
    let editorState;
    if (html) {
      const blocks = Draft.convertFromHTML(html);
      const contentState = ContentState.createFromBlockArray(blocks.contentBlocks, blocks.entityMap);
      editorState = EditorState.createWithContent(contentState);
    } else {
      editorState = EditorState.createEmpty();
    }
    this.onChange(editorState);
  }

  render() {
    return (
      <div className="editor-root">
        <ButtonToolbar>
          <ButtonGroup style={{ marginLeft: 0 }}>
            <Button
              bsSize="small"
              active={this.state.buttons.BOLD}
              onMouseDown={() => this.onToggleInlineStyle('BOLD')}
            >
              <i className="fa fa-bold" aria-hidden="true" />
            </Button>
          </ButtonGroup>
          <ButtonGroup>
            <Button
              bsSize="small"
              active={this.state.buttons.ITALIC}
              onMouseDown={() => this.onToggleInlineStyle('ITALIC')}
              disabled={!config.editor.supportEnhancedFormat}
            >
              <i className="fa fa-italic" aria-hidden="true" />
            </Button>
            <Button
              bsSize="small"
              active={this.state.buttons.UNDERLINE}
              onMouseDown={() => this.onToggleInlineStyle('UNDERLINE')}
              disabled={!config.editor.supportEnhancedFormat}
            >
              <i className="fa fa-underline" aria-hidden="true" />
            </Button>
            <Button
              bsSize="small"
              active={this.state.buttons.STRIKETHROUGH}
              onMouseDown={() => this.onToggleInlineStyle('STRIKETHROUGH')}
              disabled={!config.editor.supportEnhancedFormat}
            >
              <i className="fa fa-strikethrough" aria-hidden="true" />
            </Button>
            <Button
              bsSize="small"
              active={this.state.buttons['unordered-list-item']}
              onMouseDown={() => this.onToggleBlockType('unordered-list-item')}
              disabled={!config.editor.supportEnhancedFormat}
            >
              <i className="fa fa-list-ul" aria-hidden="true" />
            </Button>
            <Button
              bsSize="small"
              active={this.state.buttons['ordered-list-item']}
              onMouseDown={() => this.onToggleBlockType('ordered-list-item')}
              disabled={!config.editor.supportEnhancedFormat}
            >
              <i className="fa fa-list-ol" aria-hidden="true" />
            </Button>
          </ButtonGroup>
          { !config.editor.supportEnhancedFormat &&
            <div
              style={{
                width: '160px',
                height: '30px',
                position: 'relative',
                left: '36px',
                backgroundColor: 'rgba(228, 228, 228, 0.6)',
                color: '#8e8e8e',
                textAlign: 'center',
                lineHeight: '30px',
              }}
            >
              <div style={{ position: 'absolute', width: '100%', fontSize: '12px' }}>추후 지원 예정</div>
            </div>
          }
        </ButtonToolbar>
        <Editor
          className="RichEditor-editor"
          editorState={this.state.editorState}
          onChange={s => this.onChange(s)}
          onTab={e => this.onTab(e)}
          placeholder={this.props.placeholder}
        />
      </div>
    );
  }
}

RichEditor.propTypes = {
  onChange: PropTypes.func,
  value: PropTypes.string,
  placeholder: PropTypes.string,
};
RichEditor.defaultProps = {
  onChange: () => {},
  value: '',
  placeholder: '',
};
