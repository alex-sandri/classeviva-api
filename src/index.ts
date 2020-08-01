import fetch, { Response } from "node-fetch";
import cookie from "cookie";

export interface ClasseVivaProfile
{
	name: string,
	school: string,
}

export class ClasseViva
{
	constructor(private sessionId: string)
	{}

	public async getProfile(): ClasseVivaProfile
	{
		// TODO
	}

	public static async createSession(uid: string, pwd: string): Promise<ClasseViva>
	{
		const response = await fetch("https://web.spaggiari.eu/auth-p7/app/default/AuthApi4.php?a=aLoginPwd", {
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
