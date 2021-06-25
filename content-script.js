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

function warn(e){
	const a = e.currentTarget;
	if( a.hasAttribute('href') ){
		if (  startWithProtoRegex.test(a.href) ) {
			const a_text = a.text.trimStart().split(' ')[0];
			const href_url = new URL(a.href);
			const href_protocol = href_url.protocol;
			if (  (startWithProtoRegex.test(a_text) && a.href !== a_text)
				||  (startWithOutProto.test(a_text) && ( (href_protocol +'//' + a_text) !== a.href))
			) { 
				const result = confirm('WARNING: LINK TEXT DOES NOT MATCH TARGET!!!\n\nLink Text: "'+ a.text + '" \nLink Target: "' + a.href +'" \n\n Click (OK) to continue or (Cancel) to stop navigation');
				if(!result){
					e.preventDefault();
					return false;
				}
			}

		}
	}
	return true;
	/* */
	//e.preventDefault();return false;
	/* */
}

function addWarnToNewAnchors(mutationList, observer){

const as = document.getElementsByTagName("a");
for (const a of as) {
	a.removeEventListener("click", warn, false);
	a.addEventListener("click", warn, false);
}
	/*
	mutationList.forEach( (mutation) => {
		if (mutation.type === 'childList') {
			mutation.addedNodes.forEach( (aNode) => {
				if(aNode.nodeName.toLowerCase() === 'a') {
					log('debug', 'added eventlistener');
					aNode.addEventListener("click", warn, false);
				}
			});
		}
	});
	*/
}

// inital add eventListener to all anchors
addWarnToNewAnchors();

// monitor changes 
(new MutationObserver(addWarnToNewAnchors)).observe(document.body, { attributes: false, childList: true, subtree: true }); 

