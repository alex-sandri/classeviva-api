import fetch, { Response, RequestInit } from "node-fetch";
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
}

export interface ClasseVivaAgendaItem
{
	id: string,
	title: string,
	start: string,
	end: string,
	allDay: boolean,
	data_inserimento: string,
	note_2: string,
	master_id: string | null,
	classe_id: string,
	classe_desc: string,
	gruppo: number,
	autore_desc: string,
	autore_id: string,
	tipo: string,
	materia_desc: string | null,
	materia_id: string | null,
}

export class ClasseViva
{
	private static YEAR = "19";

	private static ENDPOINTS = {
		auth: () => `https://web${ClasseViva.YEAR}.spaggiari.eu/auth-p7/app/default/AuthApi4.php?a=aLoginPwd`,
		profile: () => `https://web${ClasseViva.YEAR}.spaggiari.eu/home/app/default/menu_webinfoschool_studenti.php`,
		grades: () => `https://web${ClasseViva.YEAR}.spaggiari.eu/cvv/app/default/genitori_note.php?filtro=tutto`,
		agenda: () => `https://web${ClasseViva.YEAR}.spaggiari.eu/fml/app/default/agenda_studenti.php?ope=get_events`,
	};

	constructor(private sessionId: string)
	{}

	public async getProfile(): Promise<ClasseVivaProfile>
	{
		const response = await this.request(ClasseViva.ENDPOINTS.profile());

		const $ = cheerio.load(await response.buffer());

		return <ClasseVivaProfile>{
			name: $(".name").text(),
			school: $(".scuola").text(),
		};
	}

	public async getGrades(): Promise<ClasseVivaGrade[]>
	{
		const response = await this.request(ClasseViva.ENDPOINTS.grades());

		const $ = cheerio.load(await response.buffer());

		const grades: ClasseVivaGrade[] = [];

		$(".registro").each((i, element) =>
		{
			const subject = $(element).text();

			$(element).parent().nextUntil("tr[align=center]").each(((i, grade) =>
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

	public async getAgenda(start: number, end: number): Promise<ClasseVivaAgendaItem[]>
	{
		const response = await this.request(ClasseViva.ENDPOINTS.agenda(), {
			method: "POST",
			body: new URLSearchParams({ start: start.toString(), end: end.toString() }).toString(),
			headers: {
				"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
			},
		});

		return response.json();
	}

	public static async createSession(uid: string, pwd: string): Promise<ClasseViva>
	{
		const response = await fetch(ClasseViva.ENDPOINTS.auth(), {
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

	private async request(url: string, init?: RequestInit): Promise<Response>
	{
		init = init ?? {};

		return await fetch(url, {
			...init,
			headers: {
				...init.headers,
				"Cookie": cookie.serialize("PHPSESSID", this.sessionId),
			},
		});
	}
}
