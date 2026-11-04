<p align="center">
  <img src="public/favicon.svg" alt="Maitre logosu" width="96" height="96" />
</p>

<h1 align="center">Maitre · Məhsullar paneli</h1>

<p align="center">
  Restoran menyusunu idarə etmək üçün admin panelin "Məhsullar" səhifəsi.<br />
  Maitre frontend təcrübə tapşırığı.
</p>

**Canlı demo:** https://maitre-admin.vercel.app/

---

## Layihə haqqında

Admin menyudakı bütün məhsulları bir səhifədə görür, axtarır, kateqoriyaya görə süzür, statusunu dəyişir, yeni məhsul əlavə edir və mövcud məhsulu düzəldir.

**Funksiyalar**

- Məhsul siyahısı: ad (Azərbaycan və ingilis dilində), kateqoriya, qiymət, status
- Ada görə axtarış, kateqoriya filtri, səhifələmə (hər səhifədə 10 məhsul)
- Yeni məhsul yaratmaq və mövcud məhsulu düzəltmək (modal forma, validasiya ilə)
- Siyahıdan birbaşa satış statusunu dəyişmək
- Yüklənmə, boş siyahı və xəta vəziyyətləri
- Axtarış, filter və səhifənin URL-də saxlanması
- Mobil görünüş

> `api.ts` verilən kimi saxlanılıb, dəyişdirilməyib. Real backend olmadığı üçün data brauzer yaddaşındadır və səhifə yenilənəndə ilkin vəziyyətə qayıdır.

## İşə salmaq

Node.js 20.19 və ya daha yeni versiya tələb olunur.

```bash
npm install
npm run dev
```

Digər əmrlər:

```bash
npm test
npm run build
npm run lint
```

## Əsas qərarlarım və səbəbləri

Bu tapşırıqda API qəsdən yavaşdır və təxminən 10% hallarda xəta verir. Ona görə əsas məqsədim bu üç şey oldu: **xətalar vaxtında tutulsun və sistem çökməsin**, **istifadəçinin məlumatı itməsin**, **interfeys tez işləsin**.

### 1. Xətalar vaxtında tutulur, sistem çökmür

İstifadəçi heç vaxt ağ ekran və ya "donmuş" interfeys görmür. Hər xəta baş verdiyi yerdə yerli şəkildə idarə olunur və səhifənin qalan hissəsi işləməyə davam edir.

- **Məhsul siyahısı xəta versə:** cədvəlin yerində serverin mesajı və **"Yenidən cəhd et"** düyməsi göstərilir. Başlıq, axtarış və filter yerində qalır.
- **Toggle xəta versə:** dəyişiklik dərhal geri qaytarılır və bildiriş çıxır. İstifadəçi heç nəyi itirmir.
- **Forma xəta versə:** modal bağlanmır, xəta formanın üstündə göstərilir, yazılanlar qalır. İstifadəçi "Yadda saxla"ya yenidən basır.
- **Kateqoriyalar xəta versə:** əvvəlcə 2 dəfə avtomatik təkrar cəhd olunur (xəta ehtimalını təxminən 0,1%-ə endirir). Yenə alınmasa, toolbar-da və formada "yenilə" düyməsi çıxır.
- **Köhnə sorğunun cavabı (race condition):** gecikmə təsadüfi olduğundan köhnə axtarışın cavabı yenisindən sonra gələ bilər. Hər sorğuya nömrə verilir və yalnız ən sonuncunun cavabı qəbul edilir.
- **Səhv URL-lər:** `?page=abc` kimi yanlış dəyərlər təhlükəsiz default olur, `?page=9` (aralıqdan kənar) avtomatik sonuncu səhifəyə düzəlir, mövcud olmayan `category` sıfırlanır.

### 2. İstifadəçinin məlumatı itmir

- Forma xətada bağlanmır və yazılanlar qalır.
- Forma dəyişdirilibsə (`Esc`, kənara klik, × və ya "Ləğv et") bağlamazdan əvvəl təsdiq soruşulur.
- Saxlama gedərkən modal bağlanmır, sahələr və düymələr deaktiv olur (ikiqat göndərmənin qarşısı alınır).
- Axtarış, kateqoriya və səhifə URL-də saxlanır: səhifəni yeniləyəndə və ya linki paylaşanda eyni görünüş açılır.

### 3. İnterfeys tez işləyir

- **Optimistic update:** status toggle-ı server cavabını gözləmədən dərhal dəyişir, xəta olarsa geri qayıdır.
- **Debounce (300ms):** axtarışda hər hərfə sorğu getmir.
- **Lazımsız sorğu yoxdur:** eyni axtarış/filter dəyəri üçün və dəyişiklik edilməyən formada sorğu göndərilmir. Düzəltmədən sonra siyahı yenidən yüklənmir, server cavabı ilə sətir yerində yenilənir.
- **Skeleton və "dim" fərqi:** skeleton yalnız ilk yükləmədə göstərilir. Sonrakı yükləmələrdə köhnə sətirlər solğunlaşır, beləliklə cədvəl yanıb-sönmür və hündürlüyü dəyişmir.
- Kateqoriyalar bir dəfə yüklənir və store-da saxlanır.

### 4. Texniki seçimlər

| Mövzu | Qərar | Səbəb |
|---|---|---|
| Əsas | React + TypeScript (strict) + Vite | Tələb |
| UI kitabxanası | Yoxdur, bütün komponentlər özüm yazdım | Dizayna piksel dəqiqliyi ilə uyğunluq |
| State | Zustand (products, categories, toast) | Sadə, az kod, komponentdən kənarda test olunur |
| Stil | CSS Modules + CSS dəyişənləri (`tokens.css`) | Stil bələdçisindəki dəyərlər birbaşa token kimi |
| Router | Yoxdur, `URLSearchParams` + `history.replaceState` | Bir səhifə var, router artıq yükdür |
| Select | Öz yazdığım dropdown | Native select-in açılan siyahısını dizayna uyğunlaşdırmaq mümkün deyil |
| Testlər | Jest (JS testlər) | util, store və api qatları test olunur |
| Struktur | `app` → `features` → `shared` | Asılılıq yalnız aşağıya gedir |

### 5. Dizayn

- Rənglər, şriftlər (Hanken Grotesk, Onest), ölçülər, radiuslar və boşluqlar stil bələdçisindən götürülüb. Sütun mövqeləri, düymə və toggle ölçüləri dizayn şəklindən ölçülüb.
- Dizaynda olmayan ekranları (forma, yüklənmə, boş siyahı, xəta) stil bələdçisinə uyğun özüm hazırladım.
- **Dizaynda mobil ekran yox idi.** Masaüstü dizayndan və stil bələdçisindən çıxış edərək özüm hazırladım: 1024px-dən aşağıda cədvəl kartlara çevrilir, 767px-dən aşağıda axtarış və filter alt-alta düzülür, pagination `2 / 5` formasına keçir, modal aşağıdan açılan panel olur.
- `<html lang="az">` yazılıb ki, BÖYÜK HƏRFLƏR (məsələn "KATEQORİYA") düzgün göstərilsin. Qiymətlərdə `tabular-nums` istifadə olunub.

### 6. Əlçatanlıq

- Semantik `<table>`, `<th scope="col">`.
- "Düzəlt" düyməsində `aria-label="Düzəlt: {ad}"`, toggle `role="switch"` və `aria-label` ilə.
- Modal: `role="dialog"`, `aria-modal`, fokus tələsi, `Esc` ilə bağlanma, bağlananda fokus əvvəlki düyməyə qayıdır, arxa fon scroll olunmur.
- Dropdown tam klaviatura ilə işləyir (↑ ↓, Home, End, Enter, Esc).
- Xəta bildirişləri ekran oxuyucuya `alert`, uğur bildirişləri `status` kimi elan olunur.
- Görünən fokus halqası və `prefers-reduced-motion` dəstəyi.

### 7. Testlər

Jest ilə əsas məntiq qatları test olunur: qiymət formatı və parse, səhifələmə alqoritmi, forma validasiyası, URL parse/serialize, `withRetry`, bütün store-lar (race condition, optimistic toggle və geri qaytarma, aralıqdan kənar səhifə daxil) və `api.ts`-in davranışı (gecikmə, təsadüfi xəta, axtarış, səhifələmə, validasiya).

```bash
npm test
```

## Tələblərdə açıq qalan məqamlar üçün qərarlarım

1. **Başlıqdakı say:** filter yoxdursa "Menyudakı bütün məhsullar · 48 məhsul", filter varsa "N məhsul tapıldı". Əlavə API sorğusu tələb etmir.
2. **Forma ayrıca səhifə deyil, modaldır.** Stil bələdçisində modal başlığı və modal radiusu var.
3. **Yaratdıqdan sonra:** modal bağlanır, uğur bildirişi çıxır, cari baxış yenidən yüklənir. API yeni məhsulu siyahının sonuna əlavə edir, ona görə o, sonuncu səhifədə görünür.
4. **Düzəltdikdən sonra:** sətir server cavabı ilə yerində yenilənir. Məhsul aktiv axtarışa artıq uyğun gəlməsə də, növbəti yükləməyə qədər siyahıda qalır.
5. **Qiymət:** vergül və nöqtə qəbul olunur (`4,5` və `4.5`), maksimum 2 onluq rəqəm, 0-dan böyük olmalıdır, yuxarı limit yoxdur.
6. **Ad uzunluğu:** hər iki adda maksimum 80 simvol (API limit qoymur, bu mənim qərarımdır).
7. **Silmə yoxdur.** API-də belə funksiya yoxdur və tələbdə də deyil.
8. **URL:** `?q=...&category=...&page=...` formatında saxlanır. Default dəyərlər URL-də yazılmır. Hər dəyişiklik `replaceState` ilə yazılır, geri düyməsi tarixçəni doldurmur.
9. **Header-dəki istifadəçi** ("Nərgiz Əliyeva") dizayndakı kimi sabit yazılıb, autentifikasiya yoxdur.
10. **Boş ingilis adı** API-yə `null` kimi göndərilir və cədvəldə `—` kimi göstərilir.
11. **Məhsul siyahısı xəta versə** avtomatik təkrar yoxdur, istifadəçi "Yenidən cəhd et" düyməsi ilə təkrarlayır (tələb xəta vəziyyətini göstərməyi istəyir). Kateqoriyalar isə 2 dəfə avtomatik təkrarlanır.
12. **Düzəltmədə heç nə dəyişməyibsə** sorğu göndərilmir, modal sadəcə bağlanır.
13. **Məlum məhdudiyyət:** məhsul uğurla yaradılandan sonra siyahını yeniləyən sorğu uğursuz olsa, cədvəl xəta vəziyyəti göstərir. Məhsul artıq yaradılıb və "Yenidən cəhd et" ilə siyahı yenilənir.

## Layihə strukturu

```
src/
├─ app/                      App, Header, LogoMark, qlobal stillər və tokenlər
├─ features/products/
│  ├─ api/                   api.ts (verilən fayl) + testlər
│  ├─ store/                 productsStore, categoriesStore
│  ├─ utils/                 validateProduct, productForm, productQuery
│  ├─ hooks/                 useProductsUrlSync
│  └─ components/            ProductsPage, ProductsToolbar, ProductsTable, ProductFormModal
└─ shared/
   ├─ ui/                    Button, Input, Select, Switch, Chip, Modal, Field,
   │                         Pagination, Skeleton, Spinner, StateBlock, Toast
   ├─ hooks/                 useDebouncedValue, useFocusTrap, useBodyScrollLock
   └─ utils/                 price, pagination, withRetry
```

Testlər test etdikləri faylın yanındadır (`*.test.js`).

## Sərf olunan vaxt

Təxminən **3,5 saat**. İşi 3 ayrı sessiyaya bölərək etdim.

## Daha çox vaxtım olsaydı

- **Rol əsaslı giriş sistemi:** yalnız admin sistemə daxil ola bilsin (login, sessiya və ya token, qorunan səhifələr, serverdə rol yoxlaması). Hazırda header-dəki istifadəçi sabit yazılıb.
- **Komponent testləri** (React Testing Library) və əsas ssenarilər üçün **e2e testlər** (Playwright).
- **Toggle xətasında "Yenidən cəhd et"** düyməsi olan bildiriş (hazırda yalnız xəta mesajı göstərilir).
- **Real backend:** `api.ts`-i `fetch` əsaslı real API qatı ilə əvəz etmək. Store-lar yalnız funksiya imzalarından asılı olduğu üçün qalan kod dəyişməz.

## Necə işlədim

Planlaşdırma və kodun yazılmasında Claude (Anthropic) ilə işlədim. Qərarları özüm verdim, kodu işə saldım, yoxladım, xətaları düzəltdim və dizayna uyğunlaşdırdım.
