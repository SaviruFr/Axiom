export function formatThreatType(type: string): string {
    const specialCases: Record<string, string> = {
        'SOCIAL_ENGINEERING': 'Social Engineering',
        'MALWARE': 'Malware',
        'UNWANTED_SOFTWARE': 'Unwanted Software',
        'POTENTIALLY_HARMFUL_APPLICATION': 'Potentially Harmful Application'
    };

    if (type in specialCases) {
        return specialCases[type];
    }

    return type.toLowerCase()
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}
