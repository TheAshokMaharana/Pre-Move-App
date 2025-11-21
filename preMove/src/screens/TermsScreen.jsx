import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    SafeAreaView,
    LayoutAnimation,
    Platform,
    UIManager,
    Animated,
} from 'react-native';
import Header from '../components/Header';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function TermsScreen() {
    const [expandedSection, setExpandedSection] = useState(null);
    const fadeAnim = useRef(new Animated.Value(0)).current; // fade animation

    const terms = [
        {
            id: 1,
            title: 'OVERVIEW',
            content: `This Terms of Service Agreement ("Agreement") is entered into by and between eleplace™, registered address le House, 8004, 1 Aerocity, Safed Pool, Saki Naka, Andheri Kurla Road, Andheri (East), Mumbai – 400072, India ("Company") and you, and is made effective as of the date of your use of this website https:/eleplace.in ("Site") or the date of electronic acceptance.

This Agreement sets forth the general terms and conditions of your use of the https://eleplace.in as well as the products and/or services purchased or accessed through this Site (the "Services").

Company may, in its sole and absolute discretion, change or modify this Agreement, and any policies or agreements which are incorporated herein, at any time, and such changes or modifications shall be effective immediately upon posting to this Site. Your use of this Site or the Services after such changes or modifications have been made shall constitute your acceptance of this Agreement as last revised.

IF YOU DO NOT AGREE TO BE BOUND BY THIS AGREEMENT AS LAST REVISED, DO NOT USE (OR CONTINUE TO USE) THIS SITE OR THE SERVICES.`
        },
        {
            id: 2,
            title: 'ELIGIBILITY',
            content: `This Site and the Services are available only to Users who can form legally binding contracts under applicable law. By using this Site or the Services, you represent and warrant that you are (i) at least eighteen (18) years of age, (ii) otherwise recognized as being able to form legally binding contracts under applicable law, and (iii) are not a person barred from purchasing or receiving the Services found under the laws of the India or other applicable jurisdiction.

If you are entering into this Agreement on behalf of a company or any corporate entity, you represent and warrant that you have the legal authority to bind such corporate entity to the terms and conditions contained in this Agreement, in which case the terms "you", "your", "User" or "customer" shall refer to such corporate entity. If, after your electronic acceptance of this Agreement, Company finds that you do not have the legal authority to bind such corporate entity, you will be personally responsible for the obligations contained in this Agreement.`
        },
        {
            id: 3,
            title: 'RULES OF USER CONDUCT',
            content: `By using this Site You acknowledge and agree that:

Your use of this Site, including any content you submit, will comply with this Agreement and all applicable local, state, national and international laws, rules and regulations.

You will not use this Site in a manner that:

- Is illegal, or promotes or encourages illegal activity;
- Promotes, encourages or engages in child pornography or the exploitation of children;
- Promotes, encourages or engages in terrorism, violence against people, animals, or property;
- Promotes, encourages or engages in any spam or other unsolicited bulk email, or computer or network hacking or cracking;
- Infringes on the intellectual property rights of another User or any other person or entity;
- Violates the privacy or publicity rights of another User or any other person or entity, or breaches any duty of confidentiality that you owe to another User or any other person or entity;
- Interferes with the operation of this Site;
- Contains or installs any viruses, worms, bugs, Trojan horses, Cryptocurrency Miners or other code, files or programs designed to, or capable of, using many resources, disrupting, damaging, or limiting the functionality of any software or hardware.

You will not:

- Copy or distribute in any medium any part of this Site, except where expressly authorized by Company,
- Copy or duplicate this Terms of Services agreement,
- Modify or alter any part of this Site or any of its related technologies,
- Access Companies Content or User Content through any technology or means other than through this Site itself.`
        },
        {
            id: 4,
            title: 'INTELLECTUAL PROPERTY',
            content: `Companies Content on this Site, including without limitation the text, software, scripts, source code, API, graphics, photos, sounds, music, videos and interactive features and the trademarks, service marks and logos contained therein ("Companies Content"), are owned by or licensed to eleplace™ in perpetuity, and are subject to copyright, trademark, and/or patent protection.

Companies Content is provided to you "as is", "as available" and "with all faults" for your information and personal, non-commercial use only and may not be downloaded, copied, reproduced, distributed, transmitted, broadcast, displayed, sold, licensed, or otherwise exploited for any purposes whatsoever without the express prior written consent of Company. No right or license under any copyright, trademark, patent, or other proprietary right or license is granted by this Agreement.`
        },
        {
            id: 5,
            title: 'YOUR USE OF USER CONTENT',
            content: `Some of the features of this Site may allow Users to view, post, publish, share, or manage (a) ideas, opinions, recommendations, or advice ("User Submissions"), or (b) literary, artistic, musical, or other content, including but not limited to photos and videos (together with User Submissions, "User Content"). By posting or publishing User Content to this Site, you represent and warrant to Company that (i) you have all necessary rights to distribute User Content via this Site or via the Services, either because you are the author of the User Content and have the right to distribute the same, or because you have the appropriate distribution rights, licenses, consents, and/or permissions to use, in writing, from the copyright or other owner of the User Content, and (ii) the User Content does not violate the rights of any third party.

You agree not to circumvent, disable or otherwise interfere with the security-related features of this Site (including without limitation those features that prevent or restrict use or copying of any Companies Content or User Content) or enforce limitations on the use of this Site, the Companies Content or the User Content therein.`
        },
        {
            id: 6,
            title: 'COMPANIES USE OF USER CONTENT',
            content: `The provisions in this Section apply specifically to Companies use of User Content posted to Site.

You shall be solely responsible for any and all of your User Content or User Content that is submitted by you, and the consequences of, and requirements for, distributing it.

With Respect to User Submissions, you acknowledge and agree that:

- Your User Submissions are entirely voluntary.
- Your User Submissions do not establish a confidential relationship or obligate Company to treat your User Submissions as confidential or secret.
- Company has no obligation, either express or implied, to develop or use your User Submissions, and no compensation is due to you or to anyone else for any intentional or unintentional use of your User Submissions.
- Company shall own exclusive rights (including all intellectual property and other proprietary rights) to any User Submissions posted to this Site, and shall be entitled to the unrestricted use and dissemination of any User Submissions posted to this Site for any purpose, commercial or otherwise, without acknowledgment or compensation to you or to anyone else.

With Respect to User Content, by posting or publishing User Content to this Site, you authorize Company to use the intellectual property and other proprietary rights in and to your User Content to enable inclusion and use of the User Content in the manner contemplated by this Site and this Agreement.`
        },
        {
            id: 7,
            title: 'DISCLAIMER OF REPRESENTATIONS AND WARRANTIES',
            content: `YOU SPECIFICALLY ACKNOWLEDGE AND AGREE THAT YOUR USE OF THIS SITE SHALL BE AT YOUR OWN RISK AND THAT THIS SITE ARE PROVIDED "AS IS", "AS AVAILABLE" AND "WITH ALL FAULTS". COMPANY, ITS OFFICERS, DIRECTORS, EMPLOYEES, AGENTS, DISCLAIM ALL WARRANTIES, STATUTORY, EXPRESS OR IMPLIED, INCLUDING, BUT NOT LIMITED TO, ANY IMPLIED WARRANTIES OF TITLE, MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NON-INFRINGEMENT. COMPANY, ITS OFFICERS, DIRECTORS, EMPLOYEES, AND AGENTS MAKE NO REPRESENTATIONS OR WARRANTIES ABOUT (I) THE ACCURACY, COMPLETENESS, OR CONTENT OF THIS SITE, (II) THE ACCURACY, COMPLETENESS, OR CONTENT OF ANY SITES LINKED (THROUGH HYPERLINKS, BANNER ADVERTISING OR OTHERWISE) TO THIS SITE, AND/OR (III) THE SERVICES FOUND AT THIS SITE OR ANY SITES LINKED (THROUGH HYPERLINKS, BANNER ADVERTISING OR OTHERWISE) TO THIS SITE, AND COMPANY ASSUMES NO LIABILITY OR RESPONSIBILITY FOR THE SAME.

IN ADDITION, YOU SPECIFICALLY ACKNOWLEDGE AND AGREE THAT NO ORAL OR WRITTEN INFORMATION OR ADVICE PROVIDED BY COMPANY, ITS OFFICERS, DIRECTORS, EMPLOYEES, OR AGENTS, AND THIRD-PARTY SERVICE PROVIDERS WILL (I) CONSTITUTE LEGAL OR FINANCIAL ADVICE OR (II) CREATE A WARRANTY OF ANY KIND WITH RESPECT TO THIS SITE OR THE SERVICES FOUND AT THIS SITE, AND USERS SHOULD NOT RELY ON ANY SUCH INFORMATION OR ADVICE.`
        },
        {
            id: 8,
            title: 'LIMITATION OF LIABILITY',
            content: `IN NO EVENT SHALL COMPANY, ITS OFFICERS, DIRECTORS, EMPLOYEES, AGENTS, AND ALL THIRD PARTY SERVICE PROVIDERS, BE LIABLE TO YOU OR ANY OTHER PERSON OR ENTITY FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, PUNITIVE, OR CONSEQUENTIAL DAMAGES WHATSOEVER...`
        },
        {
            id: 9,
            title: 'INDEMNITY',
            content: `You agree to protect, defend, indemnify and hold harmless Company and its officers, directors, employees, agents from and against any and all claims, demands, costs, expenses, losses, liabilities and damages of every kind and nature (including, without limitation, reasonable attorneys’ fees) imposed upon or incurred by Company directly or indirectly arising from (i) your use of and access to this Site; (ii) your violation of any provision of this Agreement or the policies or agreements which are incorporated herein; and/or (iii) your violation of any third-party right, including without limitation any intellectual property or other proprietary right. The indemnification obligations under this section shall survive any termination or expiration of this Agreement or your use of this Site or the Services found at this Site.`
        },
        {
            id: 10,
            title: 'DATA TRANSFER',
            content: `If you are visiting this Site from a country other than the country in which our servers are located, your communications with us may result in the transfer of information across international boundaries. By visiting this Site and communicating electronically with us, you consent to such transfers.`
        },
        {
            id: 11,
            title: 'AVAILABILITY OF WEBSITE',
            content: `Subject to the terms and conditions of this Agreement and our policies, we shall use commercially reasonable efforts to attempt to provide this Site on 24/7 basis. You acknowledge and agree that from time to time this Site may be inaccessible for any reason including, but not limited to, periodic maintenance, repairs or replacements that we undertake from time to time, or other causes beyond our control including, but not limited to, interruption or failure of telecommunication or digital transmission links or other failures.

You acknowledge and agree that we have no control over the availability of this Site on a continuous or uninterrupted basis, and that we assume no liability to you or any other party with regard thereto.`
        },
        {
            id: 12,
            title: 'DISCONTINUED SERVICES',
            content: `Company reserves the right to cease offering or providing any of the Services at any time, for any or no reason, and without prior notice. Although Company makes great effort to maximize the lifespan of all its Services, there are times when a Service we offer will be discontinued. If that is the case, that product or service will no longer be supported by Company. In such case, Company will either offer a comparable Service for you to migrate to or a refund. Company will not be liable to you or any third party for any modification, suspension, or discontinuance of any of the Services we may offer or facilitate access to.`
        },
        {
            id: 13,
            title: 'FEES AND PAYMENTS',
            content: `You acknowledge and agree that your payment will be charged and processed by eleplace™.

You agree to pay any and all prices and fees due for Services purchased or obtained at this Site at the time you order the Services.

Company expressly reserves the right to change or modify its prices and fees at any time, and such changes or modifications shall be posted online at this Site and effective immediately without need for further notice to you.

Refund Policy: for products and services eligible for a refund, you may request a refund under the terms and conditions of our Refund Policy which can be accessed here.`
        },
        {
            id: 14,
            title: 'NO THIRD-PARTY BENEFICIARIES',
            content: `Nothing in this Agreement shall be deemed to confer any third-party rights or benefits.`
        },
        {
            id: 15,
            title: 'COMPLIANCE WITH LOCAL LAWS',
            content: `Company makes no representation or warranty that the content available on this Site are appropriate in every country or jurisdiction, and access to this Site from countries or jurisdictions where its content is illegal is prohibited. Users who choose to access this Site are responsible for compliance with all local laws, rules and regulations.`
        },
        {
            id: 16,
            title: 'GOVERNING LAW',
            content: `This Agreement and any dispute or claim arising out of or in connection with it or its subject matter or formation shall be governed by and construed in accordance with the laws of India, Maharashtra, to the exclusion of conflict of law rules.`
        },
        {
            id: 17,
            title: 'DISPUTE RESOLUTION',
            content: `Any controversy or claim arising out of or relating to these Terms of Services will be settled by binding arbitration. Any such controversy or claim must be arbitrated on an individual basis, and must not be consolidated in any arbitration with any claim or controversy of any other party. The arbitration must be conducted in India, Maharashtra, and judgment on the arbitration award may be entered into any court having jurisdiction thereof.`
        },
        {
            id: 18,
            title: 'TITLES AND HEADINGS',
            content: `The titles and headings of this Agreement are for convenience and ease of reference only and shall not be utilized in any way to construe or interpret the agreement of the parties as otherwise set forth herein.`
        },
        {
            id: 19,
            title: 'SEVERABILITY',
            content: `Each covenant and agreement in this Agreement shall be construed for all purposes to be a separate and independent covenant or agreement. If a court of competent jurisdiction holds any provision (or portion of a provision) of this Agreement to be illegal, invalid, or otherwise unenforceable, the remaining provisions (or portions of provisions) of this Agreement shall not be affected thereby and shall be found to be valid and enforceable to the fullest extent permitted by law.`
        },
        {
            id: 20,
            title: 'eleplace™ SERVICES',
            content: `If you do not agree to the Terms and conditions, you must immediately cease all use of, or access to, the Site. If you continue to browse and use this website you are agreeing to comply with and be bound by the following terms and conditions of use, which together with our privacy policy govern Rednile Innovations Private Limited (Owner of eleplace.in) relationship with you in relation to the Site and the Service (as described below) rendered through the site.

The Company operates the Site to provide relocation services (house and vehicle) and warehousing facilities to “users”(who have entered into the user agreement) within and outside the city (from the source of booking). The site facilitates the “Users” to calculate and obtain instant quote for their move, provided the “users” have quantified the items to be moved with detailed specifications, which when done, will not get deviated from the final quote.

eleplace™ has an adaptive algorithm which captures the inventory and computes the right truck size, packing requirements, and price. Once the consumer confirms the booking on the platform, based on its proprietary algorithm the right team is allotted to the move to ensure a hassle-free relocation experience for the consumers.(subject to the conditions which are contingent)

If you call eleplace™ using our phone number listed on the Site, a eleplace™ representative will, upon your verbal consent, use your personally identifiable information to complete the steps to get a quote done for the move.

Your submission of personal information through the Website/App is governed by our Privacy Policy. (view Privacy Policy)

Notwithstanding anything to the contrary herein the Company shall in no event be liable...`
        },
        {
            id: 21,
            title: 'COMPLAINTS',
            content: `Any complaints arising out of the move shall be entertained by the Company before our Team leaves the destination. The complaints on damage will be on the goods which are unpacked by our Team. Any complaints arising out of the goods in the carton which are retained by the customer shall not be entertained by our Company. It is the responsibility of the customer to assure and check all available damage before the Team leaves the destination.`
        },
        {
            id: 22,
            title: 'MODIFICATIONS AND USER RESPONSIBILITY',
            content: `The Company may change, modify, amend, or update this agreement from time to time without any prior notification to user(s) and the amended and restated terms and conditions of use shall be effective immediately on posting. If you do not adhere to the changes, you must stop using the service. Your continued use of the Site after the posting of any amended User Agreement shall constitute your agreement to be bound by any such changes.

eleplace™ may modify, suspend, discontinue or restrict the use of any portion of the Site without notice or liability. This Agreement will be governed by and construed in accordance with the laws in India.

The User warrants that any goods removed or stored under the contract are owned by the User, or that the User has full right, power and authority to allow such removal or storage. The User shall indemnify eleplace™ against any claim arising or expense incurred as a result of any breach of this warranty. eleplace™ has the right to reject the request to carry certain items which it considers inappropriate for transfer(any article or substance which is, or is likely to be, of a dangerous, corrosive, inflammable, explosive or damaging nature). The User shall indemnify the eleplace™ against all claims in respect of such goods.

The User will notify eleplace™, if there is not suitable and convenient access to the place from which the goods are to be removed. Users hereby provide consent for eleplace™, its agents or partners to call, send email or SMS with regards to any service related to their relocation requirement.`
        },
        {
            id: 23,
            title: 'CONTACT INFORMATION',
            content: `If you have any questions about this Agreement, please contact us by email or regular mail at the following address:

eleplace™ le House, 8004, 1 Aerocity, Safed Pool, Saki Naka, Andheri Kurla Road, Andheri (East), Mumbai – 400072 India`
        }
    ];

    const toggleSection = (id) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

        if (expandedSection === id) {
            // fade out before collapsing
            Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => {
                setExpandedSection(null);
            });
        } else {
            setExpandedSection(id);
            fadeAnim.setValue(0);
            Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
        }
    };

    return (
        <>
            <Header />
            <SafeAreaView style={styles.container}>
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ padding: 20 }}
                >
                    <Text style={styles.pageTitle}>Terms & Conditions</Text>
                    <Text style={styles.note}>Tap a section to expand and view full content</Text>

                    {terms.map((term) => (
                        <View key={term.id} style={styles.termItem}>
                            <TouchableOpacity
                                onPress={() => toggleSection(term.id)}
                                style={styles.termHeader}
                            >
                                <Text style={styles.termTitle}>{term.id}. {term.title}</Text>
                                <Text style={styles.toggleIcon}>{expandedSection === term.id ? '-' : '+'}</Text>
                            </TouchableOpacity>

                            {expandedSection === term.id && (
                                <Animated.View style={[styles.termContent, { opacity: fadeAnim }]}>
                                    <Text style={styles.termText}>{term.content}</Text>
                                </Animated.View>
                            )}
                        </View>
                    ))}
                </ScrollView>
            </SafeAreaView>
        </>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    pageTitle: { fontSize: 22, fontWeight: '700', color: '#00B5A5', marginBottom: 10 },
    note: { fontSize: 14, color: '#555', marginBottom: 20 },
    termItem: { marginBottom: 10, borderRadius: 8, borderWidth: 1, borderColor: '#ccc', overflow: 'hidden' },
    termHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 15,
        backgroundColor: '#f9f9f9',
    },
    termTitle: { fontSize: 16, fontWeight: '600', color: '#000' },
    toggleIcon: { fontSize: 18, fontWeight: 'bold', color: '#00B5A5' },
    termContent: { padding: 15, backgroundColor: '#fff' },
    termText: { fontSize: 14, color: '#333', lineHeight: 20 },
});
