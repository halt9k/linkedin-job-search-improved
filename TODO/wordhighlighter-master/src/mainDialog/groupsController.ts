///<reference path="../lib/common/dao.ts" />
///<reference path="../lib/common/dictionaryEntry.ts" />
///<reference path="../lib/common/group.ts" />
///<reference path="../lib/common/settings.ts" />
///<reference path="websiteLists.ts" />

angular
    .module('mainDialog')
    .controller('groupsController', async function ($scope: any, dao: DAO) {
        $scope.groups = [];
        $scope.newGroup = {
            value: '',
            backgroundColor: 'ffff00',
            matchingType: Group.DEFAULT_MATCHING_TYPE,
            matchingLanguage: Group.DEFAULT_MATCHING_LANGUAGE,
            blockedWebsitesStr: '',
            allowedWebsitesStr: '',
        };
        $scope.showNewGroupForm = false;

        $scope.colorPickerOptions = {
            required: true,
            format: 'hex8',
            case: 'lower',
            hue: true,
            saturation: true,
            lightness: true,
            alpha: true,
            swatch: true,
            swatchBootstrap: true,
            swatchOnly: true,
            round: true,
            pos: 'bottom right',
            inputClass: 'form-control',
            close: {
                show: true,
                label: 'Close',
                class: '',
            },
            reset: {
                show: true,
                label: 'Reset',
                class: '',
            },
        };

        $scope.showMatchingInfoState = {
            SMART: false,
            STRICT: false,
        };

        $scope.showMatchingInfo = (matchingType: MatchingType) => {
            $scope.showMatchingInfoState[matchingType.toString()] = true;
        };

        $scope.colorEventApi = {
            onChange: function () {
                $scope.save(true);
            },
            onClose: function () {
                $scope.save(true);
            },
            onClear: function () {
                $scope.save(true);
            },
            onReset: function () {
                $scope.save(true);
            },
        };

        $scope.DELETE_DISABLED_GROUP_ID = Group.DEFAULT_GROUP_ID;

        $scope.load = async function () {
            return dao.getGroups().then((groups: Array<Group>) => {
                $scope.groups = groups;
                websiteListsToStrings($scope.groups);
                $scope.$apply();
            });
        };

        $scope.deleteGroup = async function (id: number) {
            $scope.groups = $scope.groups.filter((group: Group) => group.id !== id);
            await dao.saveGroups($scope.groups);
            $scope.$apply();
        };

        $scope.save = async (isValid: boolean) => {
            if (isValid) {
                stringsToWebsiteLists($scope.groups);
                return dao.saveGroups($scope.groups);
            }
        };

        $scope.onAddNewGroupClicked = async function () {
            let name: string = $scope.newGroup.name.trim();
            if (name) {
                await dao
                    .addGroup(
                        name,
                        $scope.newGroup.backgroundColor,
                        $scope.newGroup.matchingType,
                        $scope.newGroup.matchingLanguage,
                        stringToWebsiteList($scope.newGroup.blockedWebsitesStr),
                        stringToWebsiteList($scope.newGroup.allowedWebsitesStr)
                    )
                    .then((group: Group) => {
                        $scope.groups.push(group);
                        websiteListsToStrings($scope.groups);
                    });
                $scope.newGroup.name = '';
                $scope.newGroup.backgroundColor = Settings.DEFAULT_BACKGROUND_COLOR;
                $scope.newGroup.matchingType = Group.DEFAULT_MATCHING_TYPE;
                $scope.newGroup.matchingLanguage = Group.DEFAULT_MATCHING_LANGUAGE;
                $scope.newGroup.blockedWebsitesStr = '';
                $scope.newGroup.allowedWebsitesStr = '';
                $scope.newGroupForm.$setPristine();
                $scope.showNewGroupForm = false;
                $scope.$apply();
            }
        };

        function websiteListsToStrings(groups: any) {
            groups.forEach((group: any) => {
                group.blockedWebsitesStr = websiteListToStrings(group.blockedWebsites);
                group.allowedWebsitesStr = websiteListToStrings(group.allowedWebsites);
            });
        }

        function stringsToWebsiteLists(groups: any) {
            groups.forEach((group: any) => {
                group.blockedWebsites = stringToWebsiteList(group.blockedWebsitesStr);
                group.allowedWebsites = stringToWebsiteList(group.allowedWebsitesStr);
            });
        }

        await $scope.load();
    });
