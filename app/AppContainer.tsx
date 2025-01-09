import React, { useContext, memo, useEffect } from 'react';
import { CommonActions, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { batch, connect, useDispatch } from 'react-redux';
import { Linking, NativeModules, ToastAndroid } from 'react-native';

import { SetUsernameStackParamList, StackParamList } from './definitions/navigationTypes';
import Navigation from './lib/navigation/appNavigation';
import { defaultHeader, getActiveRoute, getActiveRouteName, navigationTheme } from './lib/methods/helpers/navigation';
import { RootEnum } from './definitions';
// Stacks
import AuthLoadingView from './views/AuthLoadingView';
// SetUsername Stack
import SetUsernameView from './views/SetUsernameView';
import OutsideStack from './stacks/OutsideStack';
import InsideStack from './stacks/InsideStack';
import MasterDetailStack from './stacks/MasterDetailStack';
import ShareExtensionStack from './stacks/ShareExtensionStack';
import { ThemeContext } from './theme';
import { setCurrentScreen } from './lib/methods/helpers/log';
import { appStart } from './actions/app';
import { useAppSelector } from './lib/hooks';
import { serverInitAdd } from './actions/server';
import { getStateFromPath } from "@react-navigation/native";

const createStackNavigator = createNativeStackNavigator;

// SetUsernameStack
const SetUsername = createStackNavigator<SetUsernameStackParamList>();
const SetUsernameStack = () => (
	<SetUsername.Navigator screenOptions={defaultHeader}>
		<SetUsername.Screen name='SetUsernameView' component={SetUsernameView} />
	</SetUsername.Navigator>
);

// App
const Stack = createStackNavigator<StackParamList>();
const App = memo(({ root, isMasterDetail }: { root: string; isMasterDetail: boolean }) => {
	const { theme } = useContext(ThemeContext);
	const dispatch = useDispatch();
	const server = useAppSelector(state => state.server.server);

	useEffect(() => {
		if (root) {
			const state = Navigation.navigationRef.current?.getRootState();
			const currentRouteName = getActiveRouteName(state);
			Navigation.routeNameRef.current = currentRouteName;
			setCurrentScreen(currentRouteName);
		}
	}, [root]);

	useEffect(() => {
		Linking.getInitialURL().then(url => {
			console.log('getInitialURL is -', url);
			// if(url && url.startsWith('RoomView')) {
			// 	const urlParams = url.split('/');
			// 	const rid = urlParams[1];
			// 	console.log('navigation ready', Navigation.navigationRef.current?.isReady());
			// 	Navigation.navigationRef.current?.navigate('RoomView', { rid });
			// }
		});

		Linking.addEventListener('url', event => {
			const { url } = event;
			console.log('url', url);
		});

		//NativeModules.QuickActions.clearQuickActions()

		NativeModules.QuickActions.getQuickActions().then((quickActions: any) => {
			console.log(JSON.stringify(quickActions, null, 2));
		});
		// ToastAndroid.show('Quick Actions', ToastAndroid.SHORT);
		// NativeModules.QuickActions.setQuickActions([
		// 	{
		// 		id: 'new-post',
		// 		shortLabel: 'New Post',
		// 		longLabel: 'Create a new post',
		// 		url: 'new-post'
		// 	}
		// ]);

		async function action() {
			const currentQuickActions = await NativeModules.QuickActions.getQuickActions()
			if (currentQuickActions.length === 0) {
				NativeModules.QuickActions.setQuickActions([
					{
						id: 'rocketchat://add-server',
						longLabel: 'Add Server',
						shortLabel: 'Add new server',
						url: 'NewServerView'
					},
					{
						id: 'rocketchat://directory',
						longLabel: 'Directory',
						shortLabel: 'Directory',
						url: 'DirectoryView'
					}
				]);
			}
		}

		action();
	}, []);

	if (!root) {
		return null;
	}

	const navTheme = navigationTheme(theme);

	console.log('root', root);

	return (
		<NavigationContainer
			linking={{
				prefixes: ['rocketchat://'],
				config: {
					screens: {
						InsideStack: {
							screens: {
								DrawerNavigator: {
									screens: {
										ChatsStackNavigator: {
											initialRouteName: 'RoomsListView',
											screens: {
												RoomsListView: 'RoomsListView',
												RoomView: {
													path: 'RoomView/:rid',
													parse: {
														rid: (rid: string) => {
															console.log('Room ID:', rid);
															return rid;
														},
													},
												},
											}
										}
									},
								},
							},
						},
					},
				}
			}}
			theme={navTheme}
			ref={Navigation.navigationRef}
			onStateChange={state => {
				const previousRouteName = Navigation.routeNameRef.current;
				const currentRouteName = getActiveRouteName(state);
				if (previousRouteName !== currentRouteName) {
					setCurrentScreen(currentRouteName);
				}

				Navigation.routeNameRef.current = currentRouteName;

				const route = getActiveRoute(state);
				//console.log('route', state?.routes[state?.index]);
				if (route.name === 'RoomView' && route.params && route.params.rid && route.params.name && route.params.t) {
					console.log('Room Name', route.params.name);
					console.log('Room ID', route.params.rid);
					console.log('Room Type', route.params.t);

					const icon = route.params.t === 'd' ? `https://open.rocket.chat/avatar/${route.params.room.name}` : `https://open.rocket.chat/avatar/room/${route.params.rid}`;
					console.log('Icon', icon);

					const obj = {
						id: route.params.rid,
						longLabel: route.params.name.slice(0, 15),
						shortLabel: `Channel type: ${route.params.t}`,
						url: `rocketchat://RoomView/${route.params.rid}`,
						icon
					}

					NativeModules.QuickActions.getQuickActions().then((quickActions: any) => {
						const newQuickActions = [
							quickActions[0],
							quickActions[1],
							obj,
							quickActions[2],
							quickActions[3]
						].filter((item: any) => item);
						console.log(JSON.stringify(newQuickActions, null, 2));
						NativeModules.QuickActions.setQuickActions([obj]);
					});
				}
			}}
		// onReady={async () => {
		// 	const initialUrl = await Linking.getInitialURL();
		// 	if(initialUrl && initialUrl.startsWith('RoomView')) {
		// 		const rid = initialUrl.split('/')[1];
		// 		Navigation.navigationRef.current?.navigate('RoomView', { rid });
		// 	}else if(initialUrl === 'NewServerView') {
		// 		batch(() => {
		// 			dispatch(appStart({ root: RootEnum.ROOT_OUTSIDE }));
		// 			dispatch(serverInitAdd(server));
		// 		});
		// 	}
		// }}
		>
			<Stack.Navigator screenOptions={{ headerShown: false, animation: 'none' }}>
				{root === RootEnum.ROOT_LOADING || root === RootEnum.ROOT_LOADING_SHARE_EXTENSION ? (
					<Stack.Screen name='AuthLoading' component={AuthLoadingView} />
				) : null}
				{root === RootEnum.ROOT_OUTSIDE ? <Stack.Screen name='OutsideStack' component={OutsideStack} /> : null}
				{root === RootEnum.ROOT_INSIDE && isMasterDetail ? (
					<Stack.Screen name='MasterDetailStack' component={MasterDetailStack} />
				) : null}
				{root === RootEnum.ROOT_INSIDE && !isMasterDetail ? <Stack.Screen name='InsideStack' component={InsideStack} /> : null}
				{root === RootEnum.ROOT_SET_USERNAME ? <Stack.Screen name='SetUsernameStack' component={SetUsernameStack} /> : null}
				{root === RootEnum.ROOT_SHARE_EXTENSION ? (
					<Stack.Screen name='ShareExtensionStack' component={ShareExtensionStack} />
				) : null}
			</Stack.Navigator>
		</NavigationContainer>
	);
});
const mapStateToProps = (state: any) => ({
	root: state.app.root,
	isMasterDetail: state.app.isMasterDetail
});

const AppContainer = connect(mapStateToProps)(App);
export default AppContainer;
