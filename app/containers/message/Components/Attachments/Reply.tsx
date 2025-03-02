import { dequal } from 'dequal';
import moment from 'moment';
import React, { useContext, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';

import { IAttachment, TGetCustomEmoji } from '../../../../definitions';
import { themes } from '../../../../lib/constants';
import { fileDownloadAndPreview } from '../../../../lib/methods/helpers';
import { formatAttachmentUrl } from '../../../../lib/methods/helpers/formatAttachmentUrl';
import openLink from '../../../../lib/methods/helpers/openLink';
import { TSupportedThemes, useTheme } from '../../../../theme';
import sharedStyles from '../../../../views/Styles';
import RCActivityIndicator from '../../../ActivityIndicator';
import Markdown from '../../../markdown';
import MessageContext from '../../Context';
import Touchable from '../../Touchable';

const styles = StyleSheet.create({
	button: {
		flex: 1,
		alignItems: 'center',
		marginVertical: 4,
		alignSelf: 'flex-start',
		borderLeftWidth: 4,
		borderRadius: 4,
		paddingBottom: 4
	},
	attachmentContainer: {
		flex: 1,
		borderRadius: 4,
		flexDirection: 'row',
		paddingVertical: 4,
		paddingLeft: 8
	},
	backdrop: {
		...StyleSheet.absoluteFillObject
	},
	authorContainer: {
		flex: 1,
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 8
	},
	titleAndDescriptionContainer: {
		flexDirection: 'column',
		flex: 1,
		width: '100%'
	},
	authorImage: {
		width: 24,
		height: 24,
		marginRight: 5,
		borderRadius: 5
	},
	author: {
		fontSize: 16,
		...sharedStyles.textMedium,
		flexShrink: 1
	},
	fieldsContainer: {
		flex: 1
	},
	fieldContainer: {
		flexDirection: 'column',
		marginTop: 10
	},
	fieldTitle: {
		fontSize: 16,
		...sharedStyles.textSemibold
	},
	fieldValue: {
		fontSize: 14,
		...sharedStyles.textRegular
	},
	marginTop: {
		marginTop: 4
	},
	marginBottom: {
		marginBottom: 4
	},
	image: {
		height: 80,
		width: 80,
		borderRadius: 5,
		marginBottom: 1,
		marginLeft: 20,
		marginRight: 5
	},
	title: {
		flex: 1,
		fontSize: 16,
		...sharedStyles.textMedium
	},
	content: {
		flex: 1,
		flexDirection: 'row',
		paddingHorizontal: 5
	}
});

interface IMessageReply {
	attachment: IAttachment;
	timeFormat?: string;
	index: number;
	getCustomEmoji: TGetCustomEmoji;
	msg?: string;
	showAttachment?: (file: IAttachment) => void;
	content?: React.ReactElement | null;
}

const Author = React.memo(
	({ attachment, theme }: { attachment: IAttachment; theme: TSupportedThemes }) => {
		return (
			<View style={styles.authorContainer}>
				{attachment.author_icon ? <Image style={styles.authorImage} source={{ uri: attachment.author_icon }} /> : null}
				{attachment.author_name ? <Text style={[styles.author, { color: themes[theme].fontDefault }]}>{attachment.author_name}</Text> : null}
			</View>
		)
	}
);

const Title = React.memo(
	({ attachment, theme }: { attachment: IAttachment; theme: TSupportedThemes }) => {
		return (
			<View style={styles.authorContainer}>
				{attachment.title ? <Text style={[styles.title, { color: themes[theme].fontDefault }]}>{attachment.title}</Text> : null}
			</View>
		);
	}
);

const Description = React.memo(
	({
		attachment,
		getCustomEmoji,
		theme
	}: {
		attachment: IAttachment;
		getCustomEmoji: TGetCustomEmoji;
		theme: TSupportedThemes;
	}) => {
		const { user } = useContext(MessageContext);
		const text = attachment.text;

		if (!text) {
			return null;
		}

		return (
			<Markdown
				msg={text}
				style={[{ color: themes[theme].fontHint }]}
				username={user.username}
				getCustomEmoji={getCustomEmoji}
			/>
		);
	},
	(prevProps, nextProps) => {
		if (prevProps.attachment.text !== nextProps.attachment.text) {
			return false;
		}
		if (prevProps.attachment.title !== nextProps.attachment.title) {
			return false;
		}
		if (prevProps.theme !== nextProps.theme) {
			return false;
		}
		return true;
	}
);

const UrlImage = React.memo(
	({ image }: { image?: string }) => {
		const { baseUrl, user } = useContext(MessageContext);

		if (!image) {
			return null;
		}

		image = image.includes('http') ? image : `${baseUrl}/${image}?rc_uid=${user.id}&rc_token=${user.token}`;
		return <Image source={{ uri: image }} style={styles.image} contentFit='cover' />;
	},
	(prevProps, nextProps) => prevProps.image === nextProps.image
);

const Fields = React.memo(
	({
		attachment,
		theme,
		getCustomEmoji
	}: {
		attachment: IAttachment;
		theme: TSupportedThemes;
		getCustomEmoji: TGetCustomEmoji;
	}) => {
		const { user } = useContext(MessageContext);

		if (!attachment.fields) {
			return null;
		}

		return (
			<View style={styles.fieldsContainer}>
				{attachment.fields.map(field => (
					<View key={field.title} style={[styles.fieldContainer]}>
						<Text style={[styles.fieldTitle, { color: themes[theme].fontDefault }]}>{field.title}</Text>
						<Markdown msg={field?.value || ''} username={user.username} getCustomEmoji={getCustomEmoji} />
					</View>
				))}
			</View>
		);
	},
	(prevProps, nextProps) =>
		dequal(prevProps.attachment.fields, nextProps.attachment.fields) && prevProps.theme === nextProps.theme
);

const Reply = React.memo(
	({ attachment, index, getCustomEmoji, msg, showAttachment, content }: IMessageReply) => {
		const [loading, setLoading] = useState(false);
		const { theme, colors } = useTheme();
		const { baseUrl, user, id, e2e, isEncrypted } = useContext(MessageContext);

		if (!attachment || (isEncrypted && !e2e)) {
			return null;
		}

		const onPress = async () => {
			let url = attachment.cache_path || attachment.author_link;
			if (!url) {
				return;
			}
			if (attachment.type === 'file' && attachment.cache_path) {
				setLoading(true);
				url = formatAttachmentUrl(attachment.cache_path, user.id, user.token, baseUrl);
				await fileDownloadAndPreview(url, attachment, id);
				setLoading(false);
				return;
			}
			openLink(url, theme);
		};

		let { strokeLight } = themes[theme];
		if (attachment.color) {
			strokeLight = attachment.color;
		}

		return (
			<>
				{/* The testID is to test properly quoted messages using it as ancestor  */}
				<Touchable
					testID={`reply-${attachment?.author_name}-${attachment?.text}`}
					style={[
						styles.button,
						index > 0 && styles.marginTop,
						msg && styles.marginBottom,
						{
							borderColor: strokeLight,
							backgroundColor: theme === 'light' ? colors.surfaceTint : colors.surfaceNeutral
						}
					]}
					background={Touchable.Ripple(colors.surfaceNeutral)}
					disabled={!!(loading || attachment.message_link)}>
					<>
						<View style={styles.attachmentContainer}>
							<View style={styles.titleAndDescriptionContainer}>
								<Author attachment={attachment} theme={theme} />
								<Title attachment={attachment} theme={theme} />
								<Description attachment={attachment} getCustomEmoji={getCustomEmoji} theme={theme} />
								<Fields attachment={attachment} getCustomEmoji={getCustomEmoji} theme={theme} />
								{loading ? (
									<View style={[styles.backdrop]}>
										<View
											style={[
												styles.backdrop,
												{ backgroundColor: themes[theme].surfaceNeutral, opacity: themes[theme].attachmentLoadingOpacity }
											]}></View>
										<RCActivityIndicator />
									</View>
								) : null}
							</View>
							<UrlImage image={attachment.thumb_url} />
						</View>
						<View style={styles.content}>
							{content}
						</View>
					</>
				</Touchable>
				<Markdown msg={msg} username={user.username} getCustomEmoji={getCustomEmoji} />
			</>
		);
	},
	(prevProps, nextProps) => false
);

Reply.displayName = 'MessageReply';
Title.displayName = 'MessageReplyTitle';
Description.displayName = 'MessageReplyDescription';
Fields.displayName = 'MessageReplyFields';

export default Reply;
