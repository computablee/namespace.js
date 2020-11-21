function isAlphaNumeric(str) {
  var code, i, len;

  for (i = 0, len = str.length; i < len; i++) {
    code = str.charCodeAt(i);
    if (!(code > 47 && code < 58) && // numeric (0-9)
        !(code > 64 && code < 91) && // upper alpha (A-Z)
        !(code > 96 && code < 123)) { // lower alpha (a-z)
      return false;
    }
  }
  return true;
}

const fs = require("fs");

if (process.argv.length == 2)
	console.log("\x1b[31m", "Error:", "\x1b[0m", "no input file.\n");

const inp = fs.readFileSync(process.argv[2]).toString();
let outp = "";
let namespaces = [];

let keywords = ["char", "signed", "unsigned", "short", "int", "long", "float", "double", "*", "struct", "void"];
//let regexes = [/struct[ \r\n\t]+([A-Za-z0-9\_]+)[ \r\n\t]*\{/g, /typedef[ \r\n]+struct[ \r\n\t]+([A-Za-z0-9\_]+)[ \r\n\t]*\{/g, /typedef [ \r\n\t]+struct[ \r\n\t]*{/g];
let regexes = [/struct[ \r\n\t]+([A-Za-z0-9\_]+)[ \r\n\t]*\{/g];
let funcdecl = false;
let struct = false;
let structdecl = false;
let structbrace = [];
let parens = 0;
let braces = 0;
let namebrace = [];

for (let i = 0; i < inp.length; i++)
{
	regexes.forEach((regex, particular) =>
	{
		let match;
		if ((match = regex.exec(inp.substring(i))) !== null && match.index == 0)
		{
			i += match[0].length;
			switch (particular)
			{
				case 0:
					outp += "struct " + (namespaces.length > 0 ? namespaces.join("__") + "__" : "") + match[1] + "{";
					structbrace.push(braces++);
					structdecl = true;
					return;
				/*case 1:
					outp += "typedef struct " + (namespaces.length > 0 ? namespaces.join("__") + "__" : "") + match[1] + "{";
					structbrace.push(braces++);
					structdecl = true;
					return;
				case 2:
					outp += "typedef struct {";
					structbrace.push(braces++);
					structdecl = true;
					return;*/
				default:
					break;
			} 
		}
	});
	
	if (inp.substring(i, i + 2) == "::")
	{
		outp += "__";
		i++;
		continue;
	}
	
	//console.log(outp);
	if (inp.substring(i, i + 9) === "namespace")
	{
		i += 9;
		let parsing = true;
		namespaces.push("");
		
		do
		{
			if (isAlphaNumeric(inp[i]) || inp[i] == '_')
				namespaces[namespaces.length - 1] += inp[i];
			else if (inp[i] == '{')
				parsing = false;
			i++;
		}
		while (parsing);
		
		namebrace.push(braces++);
		
		continue;
	}
	
	if (inp[i] == '(') parens++;
	if (inp[i] == ')') parens--;
	
	if (inp[i] == '{') braces++;
	if (inp[i] == '}')
	{
		braces--;
		if (namebrace[namebrace.length - 1] === braces)
		{
			namespaces.pop();
			namebrace.pop();
			i++;
			continue;
		}
		
		if (structbrace[structbrace.length - 1] === braces)
		{
			structbrace.pop();
			outp += "} ";
			i++;
			while (inp[i] == ' ' || inp[i] == '\n' || inp[i] == '\r' || inp[i] == '\t')
				i++;
			if (inp[i] != ';')
				outp += (namespaces.length > 0 ? namespaces.join("__") + "__" : "") + inp[i];
			else
				outp += ';';
			continue;
		}
	}
	//console.log(braces, namebrace[namebrace.length - 1]);
	if (namebrace.length > 0 && braces > namebrace[namebrace.length - 1] + 1)
	{
		outp += inp[i];
		continue;
	}
	
	keywords.forEach(name =>
	{
		if (inp.substring(i, i + name.length) == name && parens == 0 && structbrace.length == 0 && !isAlphaNumeric(inp[i - 1]) && !isAlphaNumeric(inp[i + name.length]) && inp[i - 1] !== '_' && inp[i + name.length] !== '_')
		{
			funcdecl = true;
			i += name.length;
			if (name == "struct")
				struct = true;
			outp += name;
			return;
		}
	});
	
	if (funcdecl == true && !struct && (isAlphaNumeric(inp[i]) || inp[i] == '_'))
	{
		outp += namespaces.length > 0 ? namespaces.join("__") + "__" : "";
		funcdecl = false;
	}
	
	if (funcdecl == true && struct)
	{
		let haschars = false;
		for (; i < inp.length; i++)
		{
			if (inp.substring(i, i + 2) == "::")
			{
				outp += "__";
				i++;
				continue;
			}
			
			if (isAlphaNumeric(inp[i]) || inp[i] == '_')
			{
				haschars = true;
				outp += inp[i];
				continue;
			}
			
			if ((inp[i] == ' ' || inp[i] == '\n' || inp[i] == '\r' || inp[i] == '\t') && haschars)
			{
				outp[i] += " ";
				struct = false;
				break;
			}
			
			outp += inp[i];
		}
	}
	
	outp += inp[i];
}

fs.writeFileSync("namespace_" + process.argv[2], outp);