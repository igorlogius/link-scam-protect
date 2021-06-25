const extId = 'link-scam-protect';
const temporary = browser.runtime.id.endsWith('@temporary-addon'); // debugging?

const log = (level, msg) => { 
	level = level.trim().toLowerCase();
	if (['error','warn'].includes(level) 
		|| ( temporary && ['debug','info','log'].includes(level))
	) {
		console[level]('[' + extId + '] [' + level.toUpperCase() + '] ' + msg); 
		return;
	}
}

const startWithProtoRegex = new RegExp(/^https?:\/\//);
const startWithOutProto = new RegExp(/^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+/);

function warn(e) {
	if(typeof e.target === 'undefined') {
		log('debug', 'event target is undefined');
		return;
	}
	const el = e.target;

	if( el.nodeName.toLowerCase() !== 'a') {
		log('debug','clicked element is not a anchor');
		return;
	}
	if( !el.hasAttribute('href') ){
		log('debug','link has no href attribute');
		return;
	}
	if (  !startWithProtoRegex.test(el.href) ) {
		log('debug','href doenst have a valid protocol');
		return;
	}

	const el_text = el.text.trimStart().split(' ')[0];
	const href_url = new URL(el.href);
	const href_protocol = href_url.protocol;

	if (       (startWithProtoRegex.test(el_text) && el.href !== el_text)
		|| (startWithOutProto.test(el_text) && ( (href_protocol +'//' + el_text) !== el.href))
	) { 
		const result = confirm(
			'WARNING: Link Text and Target dont match!\n' + 
			'\n' +
			'Text: "'+ el.text + '" \n' + 
			'Target: "' + el.href +'"\n' + 
			'\n' +
			'Click (OK) to continue or (Cancel) to stop' +
			'\n'
		);
		if(!result){
			e.preventDefault();
			return false;
		}
	}

	if(temporary) {
		e.preventDefault();
		return false;
	}
	return true;
}


document.addEventListener('click', warn,false);
