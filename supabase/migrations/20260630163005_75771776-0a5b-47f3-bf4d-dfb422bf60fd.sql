
UPDATE public.products
SET image_url = '/__l5e/assets-v1/d47429a8-e48e-433d-8c1d-c6410b8edc16/TUBO-MF-1.png',
    specs = COALESCE(specs, '{}'::jsonb) || jsonb_build_object('gallery', jsonb_build_array(
      '/__l5e/assets-v1/d47429a8-e48e-433d-8c1d-c6410b8edc16/TUBO-MF-1.png',
      '/__l5e/assets-v1/6020754c-14a2-4860-ae81-880eaf309e36/TUBO-MF-2.png',
      '/__l5e/assets-v1/c04c16ef-ee5b-4b64-aacd-a6c8085a3136/TUBO-MF-3.png',
      '/__l5e/assets-v1/c8a1b6e3-c6f6-44a3-993d-27c72d1d94c7/TUBO-MF-4.jpg'
    ))
WHERE sku ILIKE 'MLB*TMF*%';

UPDATE public.products
SET image_url = '/__l5e/assets-v1/45407399-11f3-4a7d-acb9-4362fab5a382/TUBO-PB-1.jpg',
    specs = COALESCE(specs, '{}'::jsonb) || jsonb_build_object('gallery', jsonb_build_array(
      '/__l5e/assets-v1/45407399-11f3-4a7d-acb9-4362fab5a382/TUBO-PB-1.jpg',
      '/__l5e/assets-v1/4a05809b-07a5-4cb6-84d1-8ab30f2ea281/TUBO-PB-2.png',
      '/__l5e/assets-v1/1c1a7768-e402-4929-94be-3d785b623871/TUBO-PB-3.png',
      '/__l5e/assets-v1/dc5bb69e-ebbe-49d1-ba6c-ed5e56a34c93/TUBO-PB-4.jpg',
      '/__l5e/assets-v1/105954ab-5e10-434f-b9b7-079f920341cb/TUBO-PB-5.webp',
      '/__l5e/assets-v1/3571b5ef-4e7d-4375-99b9-b5ca47439348/TUBO-PB-6.jpg'
    ))
WHERE sku ILIKE 'MLB*TPB*%';
