export const parseSnippet = (rawContent) => {
    if (!rawContent) return { metadata: null, code: '' };

    const lines = rawContent.split('\n');
    let isAiBlock = false;
    let inAiBlock = false;
    let description = '';
    let time_complexity = '';
    let space_complexity = '';
    let tags = [];
    let codeStartIndex = 0;

    // Check if the first few lines start with AI block marker
    if (rawContent.includes('AI GENERATED DOCUMENTATION')) {
        for (let i = 0; i < lines.length; i++) {
            let line = lines[i].trim();
            if (line === '/**' || line === '<!--' || line === '"""') {
                if (lines[i+1] && lines[i+1].includes('AI GENERATED DOCUMENTATION')) {
                    inAiBlock = true;
                    isAiBlock = true;
                    continue;
                }
            }

            if (inAiBlock) {
                if (line === '*/' || line === '-->' || line === '"""') {
                    inAiBlock = false;
                    codeStartIndex = i + 1;
                    break;
                }

                // Strip leading ' * ' for JS docs
                if (line.startsWith('*')) {
                    line = line.substring(1).trim();
                }

                if (line.startsWith('Description:')) {
                    description = line.substring('Description:'.length).trim();
                } else if (line.startsWith('Complexity:')) {
                    const comp = line.substring('Complexity:'.length).trim();
                    const parts = comp.split('|').map(p => p.trim());
                    parts.forEach(p => {
                        if (p.startsWith('Time:')) {
                            time_complexity = p.substring('Time:'.length).trim();
                        } else if (p.startsWith('Space:')) {
                            space_complexity = p.substring('Space:'.length).trim();
                        }
                    });
                } else if (line.startsWith('Tags:')) {
                    const t = line.substring('Tags:'.length).trim();
                    tags = t.split(' ').filter(x => x.startsWith('#')).map(x => x.substring(1));
                }
            }
        }
    }

    if (isAiBlock) {
        // Find the start of the actual code
        while (codeStartIndex < lines.length && lines[codeStartIndex].trim() === '') {
            codeStartIndex++;
        }
        return {
            metadata: {
                description,
                time_complexity,
                space_complexity,
                tags
            },
            code: lines.slice(codeStartIndex).join('\n'),
            rawMetadata: lines.slice(0, codeStartIndex).join('\n')
        };
    }

    return { metadata: null, code: rawContent, rawMetadata: '' };
};
