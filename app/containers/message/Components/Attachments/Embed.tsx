import React, { useContext } from 'react';
import { dequal } from 'dequal';

import Image from './Image';
import Audio from './Audio';
import Video from './Video';
import { Attachments, Reply } from './components';
import CollapsibleQuote from './CollapsibleQuote';
import AttachedActions from './AttachedActions';
import MessageContext from '../../Context';
import { IMessageAttachments } from '../../interfaces';
import { IAttachment } from '../../../../definitions';
import { getMessageFromAttachment } from '../../utils';
import { View, Text } from 'react-native';

const MessageEmbed: React.FC<IMessageAttachments> = React.memo(
	(props: IMessageAttachments) => {
		const { translateLanguage } = useContext(MessageContext);

        if(!props.attachments || props.attachments.length === 0) return null;

        const attachment = props.attachments[0];

        if(props.attachments[0].image_dimensions?.width){
            props.attachments[0].image_dimensions = { width: 100, height: 100 };
        }

		return (
            <View style={{ backgroundColor: 'green', borderRadius: 5, flexDirection: 'row', width: 30 }}>
                <View style={{ backgroundColor: attachment.color, width: 5 }} />
                <View style={{ paddingLeft: 7, paddingVertical: 5 }}>
                    <Text style={{ color: 'white', fontWeight: 'bold',  }}>{attachment.title}</Text>
                    <Text>{attachment.text}</Text>
                    <View style={{ flexDirection: 'row', marginTop: 5, maxWidth: 100 }}>
                        <Attachments {...props} />
                    </View>
                </View>
            </View>
        )
	},
	(prevProps, nextProps) => dequal(prevProps.attachments, nextProps.attachments)
);

export default MessageEmbed;
