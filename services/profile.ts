
import GraphApi from './graph-api'
import i18n from 'i18n'
import config from 'config'

const locales = i18n.languages

export default class Profile {
	setWebhook() {
		GraphApi.callSubscriptionsAPI({});
		GraphApi.callSubscribedApps({});
	}

	setPageFeedWebhook() {
		GraphApi.callSubscriptionsAPI('feed');
		GraphApi.callSubscribedApps('feed');
	}

	setThread() {
		let profilePayload = {
			...this.getGetStarted(),
			...this.getGreeting(),
			...this.getPersistentMenu(),
		};

		GraphApi.callMessengerProfileAPI(profilePayload);
	}

	setGetStarted() {
		let getStartedPayload = this.getGetStarted();
		GraphApi.callMessengerProfileAPI(getStartedPayload);
	}

	setGreeting() {
		let greetingPayload = this.getGreeting();
		GraphApi.callMessengerProfileAPI(greetingPayload);
	}

	setPersistentMenu() {
		let menuPayload = this.getPersistentMenu();
		GraphApi.callMessengerProfileAPI(menuPayload);
	}

	setWhitelistedDomains() {
		let domainPayload = this.getWhitelistedDomains();
		GraphApi.callMessengerProfileAPI(domainPayload);
	}

	getGetStarted() {
		return {
			get_started: {
				payload: 'GET_STARTED',
			},
		};
	}

	getGreeting() {
		let greetings = [];

		for (let locale of locales) {
			if (locale != 'dev') {
				greetings.push(this.getGreetingText(locale));
			}
		}

		return {
			greeting: greetings,
		};
	}

	getPersistentMenu() {
		let menuItems = [];

		for (let locale of locales) {
			if (locale != 'dev') {
				menuItems.push(this.getMenuItems(locale));
			}
		}

		return {
			persistent_menu: menuItems,
		};
	}

	getGreetingText(locale: string) {
		let param = locale === 'vi_VN' ? 'default' : locale;
	
		i18n.changeLanguage(locale);

		let localizedGreeting = {
			locale: param,
			text: i18n.t('profile.greeting', {
				user_first_name: '{{user_first_name}}',
			}),
		};

		console.log({ localizedGreeting });
		return localizedGreeting;
	}

	getMenuItems(locale: string) {
		let param = locale === 'vi_VN' ? 'default' : locale;

		i18n.changeLanguage(locale);

		let localizedMenu = {
			locale: param,
			composer_input_disabled: false,
			call_to_actions: [
				{
					title: i18n.t('changeConfig'),
					type: 'postback',
					payload: 'CURATION_GOT_IT',
				},
				{
					title: i18n.t('showInstruction'),
					type: 'postback',
					payload: 'CURATION_EXPLORE',
				},
			],
		};

		console.log({ localizedMenu });
		return localizedMenu;
	}

	getWhitelistedDomains() {
		let whitelistedDomains = {
			whitelisted_domains: config.whitelistedDomains,
		};

		console.log({ whitelistedDomains });
		return whitelistedDomains;
	}
};

