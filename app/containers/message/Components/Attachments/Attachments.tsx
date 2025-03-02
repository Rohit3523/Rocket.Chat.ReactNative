import React, { useContext } from 'react';
import { dequal } from 'dequal';

import Image from './Image';
import Audio from './Audio';
import Video from './Video';
import { Reply } from './components';
import CollapsibleQuote from './CollapsibleQuote';
import AttachedActions from './AttachedActions';
import MessageContext from '../../Context';
import { IMessageAttachments } from '../../interfaces';
import { IAttachment } from '../../../../definitions';
import { getMessageFromAttachment } from '../../utils';

const Attachments: React.FC<IMessageAttachments> = React.memo(
	({ attachments, timeFormat, showAttachment, style, getCustomEmoji, isReply, author }: IMessageAttachments) => {
		const { translateLanguage } = useContext(MessageContext);

		if (!attachments || attachments.length === 0) {
			return null;
		}

		const attachmentsElements = attachments.map((file: IAttachment, index: number) => {
			const msg = getMessageFromAttachment(file, translateLanguage);
			let content = null;

			if (file && file.image_url) {
				content = (
					<Image
						key={file.image_url}
						file={file}
						showAttachment={showAttachment}
						getCustomEmoji={getCustomEmoji}
						style={style}
						isReply={isReply}
						author={author}
						msg={msg}
						imagePreview={file.image_preview}
						imageType={file.image_type}
					/>
				);
			}

			if (file && file.audio_url) {
				content = (
					<Audio
						key={file.audio_url}
						file={file}
						getCustomEmoji={getCustomEmoji}
						isReply={isReply}
						style={style}
						author={author}
						msg={msg}
					/>
				);
			}

			if (file.video_url) {
				content = (
					<Video
						key={file.video_url}
						file={file}
						showAttachment={showAttachment}
						getCustomEmoji={getCustomEmoji}
						style={style}
						isReply={isReply}
						author={author}
						msg={msg}
					/>
				);
			}

			if (file && file.actions && file.actions.length > 0) {
				content = <AttachedActions attachment={file} getCustomEmoji={getCustomEmoji} />;
			}

			if (typeof file.collapsed === 'boolean') {
				content = (
					<CollapsibleQuote key={index} index={index} attachment={file} timeFormat={timeFormat} getCustomEmoji={getCustomEmoji} />
				);
			}

			if (content && !(file.color || file.thumb_url || file.author_name || file.fields?.length)) {
				return content;
			}

			return (
				<Reply
					key={index}
					index={index}
					attachment={file}
					timeFormat={timeFormat}
					getCustomEmoji={getCustomEmoji}
					msg={msg}
					showAttachment={showAttachment}
					content={content}
				/>
			);
		});
		return <>{attachmentsElements}</>;
	},
	(prevProps, nextProps) => dequal(prevProps.attachments, nextProps.attachments)
);

Attachments.displayName = 'MessageAttachments';

export default Attachments;
