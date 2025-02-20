export interface IMe {
    _id: string;
    roles: string[];
    status: string;
    active: boolean;
    name: string;
    emails: Email[];
    _updatedAt: Date;
    statusConnection: string;
    utcOffset: number;
    username: string;
    avatarETag: string;
    avatarOrigin: string;
    isOAuthUser: boolean;
    services: Services;
    email: string;
    settings: Settings;
    avatarUrl: string;
    success: boolean;
}

interface Email {
    address: string;
    verified: boolean;
}

interface Services {
    email2fa: Email2Fa;
    password: Password;
}

interface Email2Fa {
    enabled: boolean;
}

interface Password {
    exists: boolean;
}

interface Settings {
    profile: Profile;
    preferences: Preferences;
}

interface Preferences {
    hideRoles: boolean;
    hideFlexTab: boolean;
    enableAutoAway: boolean;
    desktopNotifications: string;
    unreadAlert: boolean;
    useEmojis: boolean;
    convertAsciiEmoji: boolean;
    autoImageLoad: boolean;
    saveMobileBandwidth: boolean;
    collapseMediaByDefault: boolean;
    hideUsernames: boolean;
    roomsListExhibitionMode: string;
    mergeChannels: boolean;
    sendOnEnter: string;
    viewMode: number;
    emailNotificationMode: string;
    newRoomNotification: string;
    newMessageNotification: string;
    notificationsSoundVolume: number;
    muteFocusedConversations: boolean;
    sidebarShowUnread: boolean;
    sidebarShowFavorites: boolean;
    sidebarViewMode: string;
    idleTimeLimit: number;
    sidebarGroupByType: boolean;
    desktopNotificationRequireInteraction: boolean;
    sidebarSortby: string;
    desktopNotificationDuration: number;
    displayAvatars: boolean;
    sidebarDisplayAvatar: boolean;
    pushNotifications: string;
    audioNotifications: string;
    mobileNotifications: string;
    hideAvatars: boolean;
    sidebarHideAvatar: boolean;
    alsoSendThreadToChannel: string;
    showMessageInMainThread: boolean;
    enableNewMessageTemplate: boolean;
    omnichannelTranscriptEmail: boolean;
    themeAppearence: string;
    showThreadsInMainChannel: boolean;
    notifyCalendarEvents: boolean;
    enableMobileRinging: boolean;
    omnichannelTranscriptPDF: boolean;
    sidebarSectionsOrder: string[];
    featuresPreview: string;
    masterVolume: number;
    voipRingerVolume: number;
}

interface Profile {
}
