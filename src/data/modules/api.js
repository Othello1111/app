import { delay, race, call } from 'redux-saga/effects'
import { runSaga } from 'redux-saga'
import { 
	API_ENDPOINT_URL,
	APP_BASE_URL,
	API_RETRIES,
	API_TIMEOUT
} from '../constants/app'
import ApiError from './error'

function* get(url, overrideOptions={}) {
	const res = yield req(url, overrideOptions)

	var json = {}
	if (res.headers)
		if ((res.headers.get('Content-Type')||'').toLowerCase().indexOf('application/json')!=-1){
			json = yield res.json()
			checkJSON(json)
		}

	return json;
}

function* put(url, data={}, options={}) {
	const res = yield req(url, {
		...options,
		method: 'PUT',
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(data)
	})
	const json = yield res.json()
	checkJSON(json)

	return json;
}

function* post(url, data={}, options={}) {
	const res = yield req(url, {
		...options,
		method: 'POST',
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(data)
	})
	const json = yield res.json()
	checkJSON(json)

	return json;
}

/*
	url, {
		file: {uri, name, type:'image/jpeg'}
	}
*/
function* upload(url, _body) {
	const body = new FormData()

	for (const key in _body ) {
		const val = _body[key]
		body.append(key, val)
	}

	const res = yield req(url, {
		method: 'PUT',
		body
	})

	const json = yield res.json()
	checkJSON(json)

	return json;
}

function* del(url, data={}, options={}) {
	const res = yield req(url, {
		...options,
		method: 'DELETE',
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json'
		},
		...(data ? { body: JSON.stringify(data) } : {})
	})
	const json = yield res.json()
	checkJSON(json)

	return json;
}

function* req(url, options={}) {
	var finalURL = API_ENDPOINT_URL + url

	if (url.indexOf('/') == 0)
		finalURL = APP_BASE_URL + url
	else if (url.indexOf('http') == 0)
		finalURL = url

	for(let i = 0; i < API_RETRIES; i++){
		try{
			const winner = yield race({
				req: call(fetchWrap, finalURL, {...defaultOptions, ...options}),
				...( options.timeout !== 0 ? { t: delay(API_TIMEOUT) } : {}) //timeout could be turned off if options.timeout=0
			})

			if (!winner.req)
				throw new ApiError('timeout')

			return winner.req;
		}catch({message=''}){
			if (message == 'timeout')
				break;
			else if(i < API_RETRIES-1) {
				yield delay(100); //stop 100ms and try again
			}
		}
	}

	throw new ApiError('fail', 'failed to load '+finalURL)
}

const fetchWrap = (url, options)=>(
	fetch(url, options)
		.then((res)=>{
			if (res.status >= 200 && res.status < 300)
				return res
			else
				throw new ApiError('fail', 'fail_fetch_status')
		})
)

const checkJSON = (json)=>{
	if (typeof json.auth === 'boolean')
		if (json.auth === false)
			throw new ApiError('not_authorized')
}

const defaultOptions = {
	credentials: 'include'
}

const convertGeneratorToPromise = (gen)=>function(){
	const a=arguments; 
	return runSaga({onError:()=>{}}, function*(){
		return yield gen(...a)
	}).toPromise()
}

export default {
	get,
	put,
	post,
	del,
	upload,

	_get: convertGeneratorToPromise(get),
	_put: convertGeneratorToPromise(put),
	_post: convertGeneratorToPromise(post),
	_del: convertGeneratorToPromise(del),
	_upload: convertGeneratorToPromise(upload)
}