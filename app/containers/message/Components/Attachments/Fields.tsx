import React from 'react';
import { dequal } from 'dequal';

import { AttachmentField, IAttachment } from '../../../../definitions';
import { View, Text } from 'react-native';
import { useTheme } from '../../../../theme';
import Markdown from '../../../../containers/markdown';

interface Props {
    fields: AttachmentField[] | undefined;
}

const Fields: React.FC<Props> = React.memo(
    ({ fields }: Props) => {
        const { colors } = useTheme();

        if (!fields || fields?.length === 0) return null;

        return (
            <View>
                {
                    fields?.map((field) => (
                        <View style={{ marginTop: 5 }}>
                            <Text style={{ color: colors.fontDefault, fontWeight: 'bold', fontSize: 16 }}>{field.title}</Text>
                            <Markdown msg={field.value} />
                        </View>
                    ))
                }
            </View>
        )
    },
    (prevProps, nextProps) => dequal(prevProps, nextProps)
);

export default Fields;
