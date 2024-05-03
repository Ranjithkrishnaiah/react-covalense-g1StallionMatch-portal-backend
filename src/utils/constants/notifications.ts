export enum notificationTemplates {
  farmCreatedUuid = '14C0E4CF-BC9E-440F-8053-C2CFA5E37622', // 4
  inviteOtherMembersToAFarmUuid = '41354C67-393F-4209-9617-04EFE3079758', // 5
  farmMemberTypeRequest = 'DCD15136-4970-4000-B5E8-E0B7E36C6446', // 6
  farmAdminChangedConfirmation = 'B19239F3-0301-4F09-8C02-8A6ECB08C860', // 7
  stallionExpiryReminderFarms = 'D52CB5E7-0526-4AC4-BE74-74CC6B9E653B', // 8
  renewedStallionPromotedConfirmation = '2944CEA4-ACEA-4A70-B59A-220117427ACE', // 9
  stopPromotingStallion = '723CDDF8-E886-41CC-8A26-B096146B7284', // 10
  cancellationOfStallionDueToPaymentFailureFarms = '62527CB1-EEBC-46AB-B4F4-C26ABAE8479D', // 11
  stallionHotNotificationFarms = '218DBCD1-4AA1-4F7A-9301-D948AF98E9C4', // 12
  stallionHighSearchFlagFarms = 'CCA2EEBD-45D2-4676-A0AD-083117C655B8', // 13
  farmWeeklySearchUpdateFarms = '31DE0EFA-F573-475A-85A2-03974B3FD72D', // 14
  farmMonthlySearchUpdateFarms = 'C53712D0-A458-49F2-9C85-39E28AD18F6D', // 15
  emailAddressChangedConfirmation = '6F56D4EA-B612-4FE2-B424-F8053CC3F40C', // 16
  passwordChangedConfirmation = 'C58FA063-69B9-47A2-9447-3ADFC60B113F', // 17
  farmUserLevelUpdatedOrChanged = '90141887-7063-4CA2-BD11-35EC2FE072BE', // 18
  updateMissingInformationProfile = '7F8CCF96-4A13-4739-B02A-B3EBA37BE284', // 19
  youHaveNewMessage = '69D6610B-78EF-4140-8536-9FDB5C42AC05', // 20
  youHaveNewNominationRequestFarms = 'DD416470-E529-4D80-A72A-E91CA8DA3087', // 21
  youHaveNewNominationRequestBreeders = '73A73E38-0B4A-4988-8451-4B7F52EC06E9', // 22
  nominationRequestAcceptedFarms = '435ABBBB-7E32-4973-A8A5-55574CE1ECA7', // 23
  nominationRequestAcceptedBreeders = '6997A485-644D-448A-92A3-771C5441537A', // 24
  nominationRequestRejectedFarms = '386097C8-0109-4ED2-820E-7FAE8C04B64B', // 25
  nominationRequestRejectedBreeders = 'BB0EA8C6-3B3F-44BD-8683-66BBB6131FD5', // 26
  nominationRequestCounterOfferBreeders = '697B4854-EAC4-4635-BAAC-BB0313A6385E', // 27
  orderConfirmation = 'C98BB3C8-A07B-4558-9325-B7B8BADAC16A', // 28
  orderDevilvery = '2EF073F2-559B-4ECC-A6A8-0770CA813E08', // 29
  orderRefunded = 'AC84ACAB-D775-4A4D-9DC3-8E34C75A2EE7', // 30
  farmPageUpdated = '159706F2-244A-4672-98BC-0E95A4FA5AF9', // 31
  RenewalRemainderFarms = '63418D1C-F497-ED11-B1F4-00155D01EE2B', // 34
  UpdatePaymentMethod = '8F2EC47D-CE9B-ED11-B1F4-00155D01EE2B', // 35
  boostNotification = '126D7F1D-ACAE-ED11-B1F6-00155D01EE2B', // 36
  notifyOthersForFarmInvite = 'BA3B6A59-3AFA-ED11-B1FA-00155D01EE2B', //39
  farmVerifiedConfirmationToOwnerUuid = 'C1C47E55-BB11-EE11-B1FC-00155D01EE2B', // 40
  farmCreatedConfirmationToAdminUuid = '17045439-C711-EE11-B1FC-00155D01EE2B', // 41
  stallionCreatedUuid = '19A1EDEB-A515-EE11-B1FC-00155D01EE2B', // 42
  stallionDuplicateIdentifiedUuid = 'C1B83F3B-7941-EE11-B873-F4EE08D04E43',
  pleaseConfirmYourAccount = 'FCE9AC73-672E-4FC4-A872-A87177D204F6', // 45
  requestForNewHorse = '33F3D658-34D5-4DE9-81C6-6E75B0B604EA', // 46
  requestForMare = '5D8F68FA-5839-42B3-933C-A23A7AB9D13C', 
  completedTheContactForm = '15DF0299-D979-EE11-B883-F4EE08D04E43', // 48
}

export enum notificationType {
  MESSAGING = 'MESSAGING', // 1
  STALLION_NOMINATIONS = 'STALLION_NOMINATIONS', // 2
  PROMOTIONAL = 'PROMOTIONAL', // 3
  MEMBERSHIP_UPDATES = 'MEMBERSHIP_UPDATES', // 4
  TECHNICAL_UPDATES = 'TECHNICAL_UPDATES', // 5
  SM_ANNOUNCEMENTS = 'SM_ANNOUNCEMENTS', // 6
  SYSTEM_NOTIFICATIONS = 'SYSTEM_NOTIFICATIONS', // 7
}
