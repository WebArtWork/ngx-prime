import { Component } from '@angular/core';

@Component({
    standalone: true,
    imports: [],
    template: `
        <div>
            <div class="doc-intro">
                <h1>Meet the Team</h1>
                <p>
                    <a href="https://www.primetek.com.tr" class="text-primary font-medium hover:underline"> PrimeTek </a>
                    is a world renowned vendor of popular UI Component suites including
                    <a href="https://primefaces.org" class="text-primary font-medium hover:underline"> PrimeFaces </a>
                    ,
                    <a href="https://ngx-prime.org" class="text-primary font-medium hover:underline"> ngx-prime </a>
                    ,
                    <a href="https://primereact.org" class="text-primary font-medium hover:underline"> PrimeReact </a>
                    and
                    <a href="https://primevue.org" class="text-primary font-medium hover:underline"> PrimeVue </a>
                    . All the members in our team are full time employees of PrimeTek who share the same passion and vision for open source to create awesome UI libraries.
                </p>
            </div>

            <div class="card p-20">
                <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-20">
                    <div class="flex flex-col items-center flex-auto">
                        <img src="https://primefaces.org/cdn/ngx-prime/images/team/cagatay.jpg" class="rounded-full mb-6" alt="Cagatay Civici" />
                        <span class="mb-2 text-xl font-bold text-center">Ã‡aÄŸatay Ã‡ivici</span>
                        <span class="text-center">Founder</span>
                    </div>
                    <div class="flex flex-col items-center flex-auto">
                        <img src="https://primefaces.org/cdn/ngx-prime/images/team/mert.jpg" class="rounded-full mb-6" alt="Mert Sincan" />
                        <span class="mb-2 text-xl font-bold text-center">Mert Sincan</span>
                        <span class="text-center">CTO</span>
                    </div>
                    <div class="flex flex-col items-center flex-auto">
                        <img src="https://primefaces.org/cdn/ngx-prime/images/team/dilara.jpg" class="rounded-full mb-6" alt="Dilara Can" />
                        <span class="mb-2 text-xl font-bold text-center">Dilara GÃ¼ngenci</span>
                        <span class="text-center">Business Administration</span>
                    </div>
                    <div class="flex flex-col items-center flex-auto">
                        <img src="https://primefaces.org/cdn/ngx-prime/images/team/cetin.jpg" class="rounded-full mb-6" alt="Ã‡etin Ã‡akÄ±roÄŸlu" />
                        <span class="mb-2 text-xl font-bold text-center">Ã‡etin Ã‡akÄ±roÄŸlu</span>
                        <span class="text-center">Front-End Developer</span>
                    </div>
                    <div class="flex flex-col items-center flex-auto">
                        <img src="https://primefaces.org/cdn/ngx-prime/images/team/tugce.jpg" class="rounded-full mb-6" alt="TuÄŸÃ§e KÃ¼Ã§Ã¼koÄŸlu" />
                        <span class="mb-2 text-xl font-bold text-center">TuÄŸÃ§e KÃ¼Ã§Ã¼koÄŸlu</span>
                        <span class="text-center">Front-End Developer</span>
                    </div>
                    <div class="flex flex-col items-center flex-auto">
                        <img src="https://primefaces.org/cdn/ngx-prime/images/team/atakan.jpg" class="rounded-full mb-6" alt="Atakan Tepe" />
                        <span class="mb-2 text-xl font-bold text-center">Atakan Tepe</span>
                        <span class="text-center">Front-End Developer</span>
                    </div>
                    <div class="flex flex-col items-center flex-auto">
                        <img src="https://primefaces.org/cdn/ngx-prime/images/team/mehmet.jpg" class="rounded-full mb-6" alt="Mehmet Ã‡etin" />
                        <span class="mb-2 text-xl font-bold text-center">Mehmet Ã‡etin</span>
                        <span class="text-center">Front-End Developer</span>
                    </div>
                    <div class="flex flex-col items-center flex-auto">
                        <img src="https://primefaces.org/cdn/ngx-prime/images/team/taner.jpg" class="rounded-full mb-6" alt="Taner Engin" />
                        <span class="mb-2 text-xl font-bold text-center">Taner Engin</span>
                        <span class="text-center">Front-End Developer</span>
                    </div>
                    <div class="flex flex-col items-center flex-auto">
                        <img src="https://primefaces.org/cdn/ngx-prime/images/team/giray.jpg" class="rounded-full mb-6" alt="Giray MaviÅŸ" />
                        <span class="mb-2 text-xl font-bold text-center">Giray MaviÅŸ</span>
                        <span class="text-center">Front-End Developer</span>
                    </div>

                    <div class="flex flex-col items-center flex-auto">
                        <img src="https://primefaces.org/cdn/ngx-prime/images/team/kerem.jpg" class="rounded-full mb-6" alt="Kerem YÄ±ldan" />
                        <span class="mb-2 text-xl font-bold text-center">Kerem YÄ±ldan</span>
                        <span class="text-center">Lead Designer</span>
                    </div>
                </div>
            </div>
        </div>
    `
})
export class TeamDemo {}
