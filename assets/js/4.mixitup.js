   var containerEl = document.querySelector('.mixer');
            var targetSelector = '.mix';
            var activeHash = '';
            var activePage = -1;
            
            
                        var loadMoreEl = document.querySelector('.load-more');
            var currentLimit = 7;
            var incrementAmount = 4;

            /**
             * Deserializes a hash segment (if present) into in an object.
             *
             * @return {object|null}
             */

            function deserializeHash() {
                var hash    = window.location.hash.replace(/^#/g, '');
                var obj     = null;
                var props   = [];

                if (!hash) return obj;

                obj = {};
                props = hash.split('&');

                props.forEach(function(props) {
                    var pair = props.split('=');
                    var propName = pair[0];

                    obj[propName] = propName === 'page' ? parseInt(pair[1]) : pair[1].split(',');
                });

                return obj;
            }

            /**
             * Serializes a uiState object into a string.
             *
             * @param   {object}    uiState
             * @return  {string}
             */

            function serializeUiState(uiState) {
                var output = '';

                for (var key in uiState) {
                    var values = uiState[key];

                    if (Array.isArray(values) && !values.length) continue;

                    output += key + '=';
                    output += Array.isArray(values) ? values.join(',') : values;
                    output += '&';
                };

                output = output.replace(/&$/g, '');

                return output;
            }

            /**
             * Constructs a `uiState` object using the
             * `getFilterGroupSelectors()` API method.
             *
             * @return {object}
             */

            function getUiState() {
                var page = mixer.getState().activePagination.page;

                // NB: You will need to rename the following keys to match the names of
                // your project's filter groups – these should match those defined
                // in your HTML.

                var uiState = {
                    basic: mixer.getFilterGroupSelectors('basic').map(getValueFromSelector),
                    pro: mixer.getFilterGroupSelectors('pro').map(getValueFromSelector),
                    media: mixer.getFilterGroupSelectors('media').map(getValueFromSelector)
                };

                if (page > 1) {
                    uiState.page = page;
                }

                return uiState;
            }

            /**
             * Updates the URL hash whenever the current UI state changes.
             *
             * @param   {mixitup.State} state
             * @return  {void}
             */

            function setHash(state) {
                var selector = state.activeFilter.selector;

                // Construct an object representing the current state of each
                // filter group

                var uiState = getUiState();
                var page = uiState.page || 1;

                // Create a URL hash string by serializing the uiState object

                var newHash = '#' + serializeUiState(uiState);

                if (selector === targetSelector && window.location.href.indexOf('#') > -1 && page === 1) {
                    // Equivalent to filter "all", and a hash exists, remove the hash

                    activeHash = '';

                    history.replaceState(null, document.title, window.location.pathname);
                } else if (newHash !== window.location.hash && selector !== targetSelector || page > 1) {
                    // Change the hash

                    activeHash = newHash;

                    history.replaceState(null, document.title, window.location.pathname + newHash);
                }
            }

            /**
             * Updates the mixer to a previous UI state.
             *
             * @param  {object|null}    uiState
             * @param  {boolean}        [animate]
             * @return {Promise}
             */

            function syncMixerWithPreviousUiState(uiState, animate) {
                var basic = (uiState && uiState.basic) ? uiState.basic : [];
                var pro = (uiState && uiState.pro) ? uiState.pro : [];
                var media = (uiState && uiState.media) ? uiState.media : [];

                activePage = (uiState && uiState.page) ? uiState.page : 1;

                mixer.setFilterGroupSelectors('basic', color.map(getSelectorFromValue));
                mixer.setFilterGroupSelectors('pro', size.map(getSelectorFromValue));
                mixer.setFilterGroupSelectors('media', shape.map(getSelectorFromValue));

                // Parse the filter groups (passing `false` will perform no animation)

                return mixer.parseFilterGroups(animate ? true : false);
            }

            /**
             * Converts a selector (e.g. '.green') into a simple value (e.g. 'green').
             *
             * @param   {string} selector
             * @return  {string}
             */

            function getValueFromSelector(selector) {
                return selector.replace(/^./, '');
            }

            /**
             * Converts a simple value (e.g. 'green') into a selector (e.g. '.green').
             *
             * @param   {string} selector
             * @return  {string}
             */

            function getSelectorFromValue(value) {
                return '.' + value;
            }

            /**
             * A function for filtering the values of the mixitup command object
             * generated by calling the `parseFilterGroups()` method.
             *
             * @param  {object} command
             * @return {object}
             */

            function handleParseFilterGroups(command) {
                if (activePage > 1) {
                    // If an activePage greater than 1 has been parsed
                    // from the URL, update the command with a pagination
                    // instruction

                    command.paginate = activePage;
                }

                return command;
            }

            var uiState = deserializeHash();

            // Instantiate MixItUp

            var mixer = mixitup(containerEl, {
                multifilter: {
                    enable: true
                },
                pagination: {
                      limit: currentLimit,
                    
                    maintainActivePage: false
                },
                animation: {
                    effects: 'fade translateZ(-100px)'
                },
                callbacks: {
                    onParseFilterGroups: handleParseFilterGroups,
                    onMixEnd: handleMixEnd // Call the setHash() method at the end of each operation
                }
            });

            if (uiState) {
                // If a valid uiState object is present on page load, filter the mixer

                syncMixerWithPreviousUiState(uiState);
            }
            
            
               function handleMixEnd(state) {
                // At the end of each operation, we must check whether the current
                // matching collection of target elements has additional hidden
                // elements, and enable or disable the load more button as
                // appropriate

                if (state.activePagination.limit + incrementAmount >= state.totalMatching) {
                    // Disable button

                    loadMoreEl.disabled = true;
                } else if (loadMoreEl.disabled) {
                    // Enable button

                    loadMoreEl.disabled = false;
                }
            }

            function handleLoadMoreClick() {
                // On each click of the load more button, we increment
                // the current limit by a defined amount

                currentLimit += incrementAmount;

                mixer.paginate({limit: currentLimit});
            }

            loadMoreEl.addEventListener('click', handleLoadMoreClick);
            
            