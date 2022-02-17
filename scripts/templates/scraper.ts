import {Ok, Err, Result} from 'ts-results';
import {ScraperParameters, ScraperReturned} from '../../src/class';
import {robustGet} from '../../src/network';
import {log} from '../../src/utils';

interface Temp {

}

export default async function (p: ScraperParameters): Promise<Result<ScraperReturned, string>> {
	const {taskName, url, downloadLinkRegex, versionMatchRegex, scraper_temp} = p;
	const temp: Temp = p.scraper_temp;

	//YOUR CODE HERE

	return new Ok({
		version: '0.0.0',
		downloadLink: 'http://localhost/file.exe',
	});
}
