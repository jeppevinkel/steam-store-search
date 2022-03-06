import axios from 'axios'
import cheerio from 'cheerio'
import {QueryBuilder} from './queryBuilder'
import {ISearchResult} from './interfaces'
import moment from 'moment'

export class SteamSearch {

    /**
     * Searches for games on Steam and returns a promise with the results.
     * @param query The query to search for
     */
    public static async search(query: QueryBuilder): Promise<ISearchResult[]> {
        const html = (await axios.get(query.build())).data

        const $ = cheerio.load(html)

        const games = $('div#search_resultsRows a')

        const results: ISearchResult[] = Array(games.length)

        games.each((i, el) => {
            let releaseDate = $(el).find('div.responsive_search_name_combined div.search_released').text() ?? ''
            let momentDate: moment.Moment = moment(releaseDate, 'DD MMM, YYYY')

            if (moment(releaseDate, 'DD MMM, YYYY').isValid()) {

            } else if (moment(releaseDate, 'MMM DD, YYYY').isValid()) {
                momentDate = moment(releaseDate, 'MMM DD, YYYY')
            } else if (moment(releaseDate, 'YYYY').isValid()){
                momentDate = moment(releaseDate, 'YYYY')
            }

            results[i] = {
                url: $(el).attr('href') ?? '',
                title: $(el).find('div.responsive_search_name_combined div.search_name span.title').text() ?? '',
                appId: parseInt($(el).attr('data-ds-appid') ?? '-1'),
                releaseDate: (momentDate.isValid() ? momentDate : releaseDate),
                reviewSummary: ($(el).find('div.responsive_search_name_combined div.search_reviewscore span').attr('data-tooltip-html') ?? '').replace('<br>', ', '),
            }
        })

        return results
    }
}