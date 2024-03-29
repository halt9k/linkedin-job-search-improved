///<reference path="../lib/common/dao.ts" />
///<reference path="../lib/common/dictionaryEntry.ts" />

angular
    .module('mainDialog')
    .controller(
        'wordsController',
        async function ($scope: any, NgTableParams: any, dao: DAO) {
            $scope.dictionary = [];
            $scope.newWord = {
                value: '',
                description: '',
                scrictMatch: false,
                group: Group.DEFAULT_GROUP_ID.toString(),
            };

            $scope.groups = [];
            $scope.groupIdToName = {};

            $scope.showAddingDupeError = false;

            $scope.filterByGroup = '0';

            $scope.load = async function () {
                return dao
                    .getDictionary()
                    .then((dictionary: Array<DictionaryEntry>) => {
                        $scope.dictionary = dictionary;
                        // Group ids are integers, but the dropdown selector values are strings.
                        $scope.dictionary.forEach((entry: any) => {
                            entry.groupIdStr = entry.groupId.toString();
                        });
                        $scope.tableParams = new NgTableParams(
                            {
                                count: 1000000000, // hide pager
                            },
                            {
                                dataset: $scope.dictionary,
                                counts: [], // hide page sizes
                            }
                        );
                        $scope.originalData = angular.copy($scope.dictionary);
                        return dao.getGroups();
                    })
                    .then((groups: Array<Group>) => {
                        $scope.groups = groups;
                        groups.forEach((group) => {
                            $scope.groupIdToName[group.id] = group.name;
                        });
                        $scope.$apply();
                    });
            };

            $scope.onAddNewWordClicked = async function () {
                let newValue: string = $scope.newWord.value.trim();
                if (newValue) {
                    if ($scope.isDupe(newValue)) {
                        $scope.showAddingDupeError = true;
                        return;
                    }
                    await dao
                        .addEntry(
                            newValue,
                            $scope.newWord.description,
                            $scope.newWord.strictMatch,
                            parseInt($scope.newWord.group)
                        )
                        .then((newEntry: DictionaryEntry) => {
                            $scope.dictionary.push(newEntry);
                            $scope.tableParams.reload();
                        });
                    $scope.newWord.value = '';
                    $scope.newWord.description = '';
                    $scope.newWord.strictMatch = false;
                    $scope.newWord.group = Group.DEFAULT_GROUP_ID.toString();
                    $scope.showAddingDupeError = false;
                    $scope.newWordForm.$setPristine();
                }
            };

            $scope.cancel = function (
                dictionaryEntry: any,
                dictionaryEntryForm: any
            ) {
                let originalRow = resetRow(dictionaryEntry, dictionaryEntryForm);
                angular.extend(dictionaryEntry, originalRow);
                dictionaryEntry.isDupe = false;
            };

            $scope.delete = async function (dictionaryEntry: any) {
                $scope.dictionary.splice(findEntryIndexById(dictionaryEntry.id), 1);
                $scope.tableParams.reload();
                return dao.saveDictionary($scope.dictionary);
            };

            $scope.save = async function (
                dictionaryEntry: any,
                dictionaryEntryForm: any
            ) {
                if ($scope.isDupe(dictionaryEntry.value, dictionaryEntry.id)) {
                    dictionaryEntry.isDupe = true;
                    return;
                }
                let originalRow = resetRow(dictionaryEntry, dictionaryEntryForm);
                if (changed(dictionaryEntry, originalRow)) {
                    // Group ids are integers, but the dropdown selector values are strings.
                    dictionaryEntry.groupId = parseInt(dictionaryEntry.groupIdStr);
                    dictionaryEntry.touch();
                    await dao.saveDictionary($scope.dictionary);
                }
                angular.extend(originalRow, dictionaryEntry);
                dictionaryEntry.isDupe = false;
            };

            $scope.isDupe = function (
                word: string,
                skippedId: number = undefined
            ): boolean {
                for (let i = 0; i < $scope.dictionary.length; ++i) {
                    if (
                        $scope.dictionary[i].value &&
                        $scope.dictionary[i].value.toUpperCase() === word.toUpperCase() &&
                        (!skippedId || skippedId !== $scope.dictionary[i].id)
                    ) {
                        return true;
                    }
                }
                return false;
            };

            let resetRow = function (dictionaryEntry: any, dictionaryEntryForm: any) {
                dictionaryEntry.isEditing = false;
                dictionaryEntry.isDeleting = false;
                dictionaryEntryForm.$setPristine();
                for (let i = 0; i < $scope.originalData.length; ++i) {
                    if ($scope.originalData[i].id === dictionaryEntry.id) {
                        return $scope.originalData[i];
                    }
                }
                return null;
            };

            function findEntryIndexById(id: number): number {
                for (let i = 0; i < $scope.dictionary.length; ++i) {
                    if ($scope.dictionary[i].id === id) {
                        return i;
                    }
                }
                return -1;
            }

            function changed(dictionaryEntry: any, originalRow: any) {
                return (
                    dictionaryEntry.value !== originalRow.value ||
                    dictionaryEntry.description !== originalRow.description ||
                    dictionaryEntry.strictMatch !== originalRow.strictMatch ||
                    dictionaryEntry.groupIdStr !== originalRow.groupIdStr
                );
            }

            await $scope.load();
        }
    );
