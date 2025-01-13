import React from 'react';
import { Dimensions, Text, View } from 'react-native';
import Image from 'react-native-fast-image';
import { IMessageInner } from './interfaces';
import { dequal } from 'dequal';

const { width: WINDOW_WIDTH } = Dimensions.get('window');

const width = Math.floor(WINDOW_WIDTH * 0.84);
const height = Math.floor(width * 0.6);

const Location = React.memo(
	({ location, isPreview }: IMessageInner) => {
		if (!location) {
			return null;
		}

		console.log('isPreview', isPreview);
		if (isPreview) {
			return (
				<Text>Show location</Text>
			)
		}

		return (
			<View>
				<Image style={{ width, height }} source={{ uri: `https://maps.googleapis.com/maps/api/staticmap?zoom=14&size=${Math.floor(width)}x${height}&markers=color:gray%7Clabel:%7C${location.coordinates.reverse().join(',')}&maptype=roadmap&key=google_map_key` }} />
			</View>
		);
	},
	(prevProps, nextProps) => dequal(prevProps.location, nextProps.location)
);

Location.displayName = 'MessageLocation';

export default Location;
