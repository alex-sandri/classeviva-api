import fetch, { Response } from "node-fetch";
import cookie from "cookie";
import cheerio from "cheerio";

export interface ClasseVivaProfile
{
	name: string,
	school: string,
}

export class ClasseViva
{
	private static endpoints = {
		auth: "https://web.spaggiari.eu/auth-p7/app/default/AuthApi4.php?a=aLoginPwd",
		profile: "https://web.spaggiari.eu/home/app/default/menu_webinfoschool_studenti.php"
	};

	constructor(private sessionId: string)
	{}

	public async getProfile(): Promise<ClasseVivaProfile>
	{
		const response = await this.request(ClasseViva.endpoints.profile);

		const $ = cheerio.load(await response.buffer());

		return <ClasseVivaProfile>{
			name: $(".name").text(),
			school: $(".scuola").text(),
		};
	}

	public static async createSession(uid: string, pwd: string): Promise<ClasseViva>
	{
		const response = await fetch(ClasseViva.endpoints.auth, {
			method: "POST",
			body: new URLSearchParams({ uid, pwd, cid: "", pin: "", target: "" }).toString(),
			headers: {
				"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
			},
		});

		const cookies = cookie.parse(<string>response.headers.get("set-cookie"));

		return new ClasseViva(cookies.PHPSESSID);
	}

	private async request(url: string): Promise<Response>
	{
		return await fetch(url, {
			headers: {
				"Cookie": cookie.serialize("PHPSESSID", this.sessionId),
			},
		});
	}
}
