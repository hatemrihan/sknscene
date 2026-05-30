/**
 * Lebanon Governorates (Mouhafazas) — Full list with major cities.
 * Used in checkout forms and admin governorate pricing.
 */

export type Governorate = {
    name: string;
    nameEn: string;
    cities: string[];
};

export const LEBANON_GOVERNORATES: Governorate[] = [
    {
        name: 'بيروت',
        nameEn: 'Beirut',
        cities: [
            'الأشرفية (Ashrafieh)',
            'الحمراء (Hamra)',
            'فردان (Verdun)',
            'رأس بيروت (Ras Beirut)',
            'الجميزة (Gemmayzeh)',
            'مار مخايل (Mar Mikhael)',
            'بدارو (Badaro)',
            'وسط بيروت (Downtown)',
            'المزرعة (Mazraa)',
            'المصيطبة (Musaitbeh)',
            'المنارة (Manara)',
            'روشة (Raouche)',
            'قريطم (Koreitem)',
            'الجناح (Jnah)',
            'الرملة البيضاء (Ramlet El Baida)'
        ]
    },
    {
        name: 'جبل لبنان',
        nameEn: 'Mount Lebanon',
        cities: [
            'جونية (Jounieh)',
            'جبيل (Byblos / Jbeil)',
            'بعبدا (Baabda)',
            'عالية (Aley)',
            'بحمدون (Bhamdoun)',
            'الجديدة (Jdeideh)',
            'سن الفيل (Sin El Fil)',
            'الدكوانة (Dekwaneh)',
            'جل الديب (Jal El Dib)',
            'أنطلياس (Antelias)',
            'الزلقا (Zalka)',
            'المنصورية (Mansourieh)',
            'بيت مري (Beit Mery)',
            'برومانا (Broumana)',
            'الحازمية (Hazmieh)',
            'الشويفات (Choueifat)',
            'الدامور (Damour)',
            'دير القمر (Deir El Qamar)',
            'بشامون (Bashamoun)',
            'عرمون (Aramoun)',
            'الحدث (Hadath)',
            'الروضة (Rawda)',
            'قرنة شهوان (Cornet Chahwan)',
            'ضبية (Dbayeh)',
            'اليرزة (Yarzeh)'
        ]
    },
    {
        name: 'الشمال',
        nameEn: 'North Lebanon',
        cities: [
            'طرابلس (Tripoli)',
            'الميناء (El Mina)',
            'زغرتا (Zgharta)',
            'بشري (Bcharre)',
            'البترون (Batroun)',
            'الكورة (Koura)',
            'المنية (Minieh)',
            'شكا (Chekka)',
            'اهدن (Ehden)'
        ]
    },
    {
        name: 'الجنوب',
        nameEn: 'South Lebanon',
        cities: [
            'صيدا (Saida / Saida)',
            'صور (Tyre / Sour)',
            'جزين (Jezzine)',
            'الغازية (Ghazieh)',
            'الجية (Jiyeh)',
            'حارة صيدا (Haret Saida)',
            'مغدوشة (Maghdouche)',
            'عنقون (Anqoun)'
        ]
    },
    {
        name: 'النبطية',
        nameEn: 'Nabatieh',
        cities: [
            'النبطية (Nabatieh)',
            'بنت جبيل (Bent Jbail)',
            'مرجعيون (Marjayoun)',
            'حاصبيا (Hasbaya)',
            'الخيام (Khiam)',
            'جبشيت (Gibchit)'
        ]
    },
    {
        name: 'البقاع',
        nameEn: 'Bekaa',
        cities: [
            'زحلة (Zahle)',
            'شتورا (Chtaura)',
            'راشيا (Rashaya)',
            'جب جنين (Jib Jannine)',
            'تعلبايا (Taalabaya)',
            'سعدنايل (Saadnayel)',
            'قب الياس (Qab Elias)'
        ]
    },
    {
        name: 'عكار',
        nameEn: 'Akkar',
        cities: [
            'حلبا (Halba)',
            'القبيات (Qoubaiyat)',
            'بزبينا (Bezbina)'
        ]
    },
    {
        name: 'بعلبك - الهرمل',
        nameEn: 'Baalbek-Hermel',
        cities: [
            'بعلبك (Baalbek)',
            'الهرمل (Hermel)',
            'اللبوة (Labweh)',
            'عرسال (Arsal)'
        ]
    }
];

export const EGYPT_GOVERNORATES = LEBANON_GOVERNORATES;

/**
 * Flat array of all governorate names for quick lookups.
 */
export const GOVERNORATE_NAMES = LEBANON_GOVERNORATES.map(g => g.name);

/**
 * Get cities for a specific governorate.
 */
export function getCitiesForGovernorate(governorateName: string): string[] {
    return LEBANON_GOVERNORATES.find(g => g.name === governorateName)?.cities ?? [];
}
