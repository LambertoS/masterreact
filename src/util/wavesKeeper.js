/**
 * Attempts to authenticate the user using Waves Keeper
 * @returns {Promise<Object>} The WavesKeeper API instance if authentication succeeds.
 */
export const loginWavesKeeper = async () => {
    const wavesKeeper = window.WavesKeeper; // Zugriff auf WavesKeeper-API
    if (!wavesKeeper) {
        throw new Error('WavesKeeper not found');
    }

    if (!(await (wavesKeeper.publicState()))) {
        // Überprüfen, ob der Benutzer angemeldet ist
        const authData = await wavesKeeper.auth({
            data: 'Authentication required',
            name: 'WavesKeeper App',
            icon: 'URL_zu_Ihrem_App-Icon'
        });
    }

    return wavesKeeper
}