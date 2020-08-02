import fetch, { Response } from "node-fetch";
import cookie from "cookie";
import cheerio from "cheerio";

export interface ClasseVivaProfile
{
	name: string,
	school: string,
}

export interface ClasseVivaGrade
{
	subject: string,
	grade: string,
	type: string,
	description: string,
	date: string,
};

export class ClasseViva
{
	private static endpoints = {
		auth: "https://web.spaggiari.eu/auth-p7/app/default/AuthApi4.php?a=aLoginPwd",
		profile: "https://web.spaggiari.eu/home/app/default/menu_webinfoschool_studenti.php",
		grades: "https://web.spaggiari.eu/cvv/app/default/genitori_note.php?filtro=tutto",
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

	public async getGrades(): Promise<ClasseVivaGrade[]>
	{
		const response = await this.request(ClasseViva.endpoints.grades);

		console.log(await response.text());

		const $ = cheerio.load(await response.buffer());

		const grades: ClasseVivaGrade[] = [];

		$(".registro").each((i, element) =>
		{
			const subject = $(element).text();

			$(element).parent().nextUntil("[align=center]").each(((i, grade) =>
			{
				grades.push({
					subject,
					grade: $(grade).find(".s_reg_testo").text(),
					type: $(grade).find(".voto_data").last().text(),
					description: $(grade).find("[colspan=32]").find("span").text(),
					date: $(grade).find(".voto_data").first().text(),
				});
			}));
		});

		return grades;
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

		// Use the second PHPSESSID cookie (because for some reason ClasseViva returns two PHPSESSID cookies)
		const cookies = cookie.parse(<string>response.headers.raw()["set-cookie"].pop());

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
