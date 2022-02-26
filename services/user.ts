export default class User {
  psid: string;
  firstName: string;
  lastName: string;
  locale: string;
  timezone: string;
  gender: string;

  constructor(psid: string) {
    this.psid = psid;
    this.firstName = "";
    this.lastName = "";
    this.locale = "";
    this.timezone = "";
    this.gender = "neutral";
  }
  
  setProfile(profile: any) {
    this.firstName = profile.firstName;
    this.lastName = profile.lastName;
    this.locale = profile.locale || "";
    this.timezone = profile.timezone || "";
    this.gender = profile.gender || "";
  }
};