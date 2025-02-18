import React, { useContext } from 'react';
import { View, Text } from 'react-native';

import Markdown from '../../../../markdown';
import { useMediaAutoDownload } from '../../../hooks/useMediaAutoDownload';
import { Button } from './Button';
import { MessageImage } from './Image';
import { IImageContainer } from './definitions';
import MessageContext from '../../../Context';
import { WidthAwareView } from '../../WidthAwareView';

const ImageContainer = ({
	file,
	showAttachment,
	getCustomEmoji,
	style,
	isReply,
	author,
	msg
}: IImageContainer): React.ReactElement | null => {
	const { user } = useContext(MessageContext);
	const { status, onPress, url, isEncrypted } = useMediaAutoDownload({ file, author, showAttachment });

	//console.log('file.color', file)
	const image = (
		<Button onPress={onPress}>
			<WidthAwareView>
				<View style={{ flexDirection: 'row', backgroundColor: 'black', borderRadius: 5, overflow: 'hidden' }}>
					<View style={{ width: 4, marginRight: 0.5, height: '100%', backgroundColor: file.color?.toLowerCase(), borderTopLeftRadius: 8, borderBottomLeftRadius: 8 }} />
					<View>
						<View style={{ padding: 5 }}>
							<Text style={{ color: 'white'}}>{file.title}</Text>
							<Text style={{ color: 'white'}}>{file.text}</Text>
							<Text style={{ color: 'white'}}>{file.title_link}</Text>
						</View>
						<MessageImage uri={url} status={status} encrypted={isEncrypted} />
					</View>
				</View>
			</WidthAwareView>
		</Button>
	);

	if (msg) {
		return (
			<View>
				<Markdown msg={msg} style={[isReply && style]} username={user.username} getCustomEmoji={getCustomEmoji} />
				{image}
			</View>
		);
	}

	return image;
};

ImageContainer.displayName = 'MessageImageContainer';

export default ImageContainer;
