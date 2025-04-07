/**
 * GrapesJS plugin for custom blocks and components
 */
export const customBlocksPlugin = (editor: any) => {
  // Add custom blocks category
  editor.BlockManager.addCategory({ id: 'custom-blocks', label: 'Custom Blocks' });

  // Hero Section
  editor.BlockManager.add('hero-section', {
    label: 'Hero Section',
    category: 'custom-blocks',
    content: `
      <section class="hero-section">
        <div class="container">
          <div class="row align-items-center">
            <div class="col-md-6">
              <h1>Welcome to Our Website</h1>
              <p class="lead">This is a hero section with a simple jumbotron-style component for calling extra attention to featured content or information.</p>
              <button class="btn btn-primary btn-lg">Learn more</button>
            </div>
            <div class="col-md-6">
              <img src="https://via.placeholder.com/600x400" alt="Hero Image" class="img-fluid">
            </div>
          </div>
        </div>
      </section>
    `,
    attributes: { class: 'fa fa-header' }
  });

  // Features Section
  editor.BlockManager.add('features-section', {
    label: 'Features Section',
    category: 'custom-blocks',
    content: `
      <section class="features-section py-5">
        <div class="container">
          <div class="row text-center mb-5">
            <div class="col-12">
              <h2>Our Features</h2>
              <p class="lead">Discover what makes our product special</p>
            </div>
          </div>
          <div class="row">
            <div class="col-md-4 mb-4">
              <div class="card h-100">
                <div class="card-body text-center">
                  <i class="fas fa-bolt fa-3x mb-3 text-primary"></i>
                  <h4 class="card-title">Fast</h4>
                  <p class="card-text">Our solution is optimized for speed and performance.</p>
                </div>
              </div>
            </div>
            <div class="col-md-4 mb-4">
              <div class="card h-100">
                <div class="card-body text-center">
                  <i class="fas fa-lock fa-3x mb-3 text-primary"></i>
                  <h4 class="card-title">Secure</h4>
                  <p class="card-text">Security is our top priority with end-to-end encryption.</p>
                </div>
              </div>
            </div>
            <div class="col-md-4 mb-4">
              <div class="card h-100">
                <div class="card-body text-center">
                  <i class="fas fa-cog fa-3x mb-3 text-primary"></i>
                  <h4 class="card-title">Customizable</h4>
                  <p class="card-text">Tailor our solution to fit your specific needs.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    `,
    attributes: { class: 'fa fa-th-large' }
  });

  // Testimonials Section
  editor.BlockManager.add('testimonials-section', {
    label: 'Testimonials',
    category: 'custom-blocks',
    content: `
      <section class="testimonials-section py-5 bg-light">
        <div class="container">
          <div class="row text-center mb-5">
            <div class="col-12">
              <h2>What Our Customers Say</h2>
              <p class="lead">Don't just take our word for it</p>
            </div>
          </div>
          <div class="row">
            <div class="col-md-4 mb-4">
              <div class="card h-100">
                <div class="card-body">
                  <div class="d-flex justify-content-center mb-3">
                    <img src="https://via.placeholder.com/100" alt="Customer" class="rounded-circle">
                  </div>
                  <p class="card-text text-center">"This product has completely transformed our business operations. Highly recommended!"</p>
                  <div class="text-center">
                    <h5 class="mb-0">John Doe</h5>
                    <small class="text-muted">CEO, Company Inc.</small>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-md-4 mb-4">
              <div class="card h-100">
                <div class="card-body">
                  <div class="d-flex justify-content-center mb-3">
                    <img src="https://via.placeholder.com/100" alt="Customer" class="rounded-circle">
                  </div>
                  <p class="card-text text-center">"The customer support team is exceptional. They've helped us every step of the way."</p>
                  <div class="text-center">
                    <h5 class="mb-0">Jane Smith</h5>
                    <small class="text-muted">Marketing Director, Brand Co.</small>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-md-4 mb-4">
              <div class="card h-100">
                <div class="card-body">
                  <div class="d-flex justify-content-center mb-3">
                    <img src="https://via.placeholder.com/100" alt="Customer" class="rounded-circle">
                  </div>
                  <p class="card-text text-center">"We've seen a 200% increase in productivity since implementing this solution."</p>
                  <div class="text-center">
                    <h5 class="mb-0">Robert Johnson</h5>
                    <small class="text-muted">CTO, Tech Solutions</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    `,
    attributes: { class: 'fa fa-comments' }
  });

  // Pricing Table
  editor.BlockManager.add('pricing-table', {
    label: 'Pricing Table',
    category: 'custom-blocks',
    content: `
      <section class="pricing-section py-5">
        <div class="container">
          <div class="row text-center mb-5">
            <div class="col-12">
              <h2>Pricing Plans</h2>
              <p class="lead">Choose the plan that works for you</p>
            </div>
          </div>
          <div class="row">
            <div class="col-md-4 mb-4">
              <div class="card h-100">
                <div class="card-header text-center bg-light">
                  <h4 class="my-0 font-weight-normal">Basic</h4>
                </div>
                <div class="card-body text-center">
                  <h1 class="card-title pricing-card-title">$9.99 <small class="text-muted">/ mo</small></h1>
                  <ul class="list-unstyled mt-3 mb-4">
                    <li>10 users included</li>
                    <li>2 GB of storage</li>
                    <li>Email support</li>
                    <li>Help center access</li>
                  </ul>
                  <button type="button" class="btn btn-lg btn-block btn-outline-primary">Sign up for free</button>
                </div>
              </div>
            </div>
            <div class="col-md-4 mb-4">
              <div class="card h-100 border-primary">
                <div class="card-header text-center bg-primary text-white">
                  <h4 class="my-0 font-weight-normal">Pro</h4>
                </div>
                <div class="card-body text-center">
                  <h1 class="card-title pricing-card-title">$29.99 <small class="text-muted">/ mo</small></h1>
                  <ul class="list-unstyled mt-3 mb-4">
                    <li>20 users included</li>
                    <li>10 GB of storage</li>
                    <li>Priority email support</li>
                    <li>Help center access</li>
                  </ul>
                  <button type="button" class="btn btn-lg btn-block btn-primary">Get started</button>
                </div>
              </div>
            </div>
            <div class="col-md-4 mb-4">
              <div class="card h-100">
                <div class="card-header text-center bg-light">
                  <h4 class="my-0 font-weight-normal">Enterprise</h4>
                </div>
                <div class="card-body text-center">
                  <h1 class="card-title pricing-card-title">$99.99 <small class="text-muted">/ mo</small></h1>
                  <ul class="list-unstyled mt-3 mb-4">
                    <li>50 users included</li>
                    <li>30 GB of storage</li>
                    <li>Phone and email support</li>
                    <li>Help center access</li>
                  </ul>
                  <button type="button" class="btn btn-lg btn-block btn-outline-primary">Contact us</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    `,
    attributes: { class: 'fa fa-usd' }
  });

  // Contact Form
  editor.BlockManager.add('contact-form', {
    label: 'Contact Form',
    category: 'custom-blocks',
    content: `
      <section class="contact-section py-5">
        <div class="container">
          <div class="row justify-content-center">
            <div class="col-md-8">
              <div class="card">
                <div class="card-header bg-primary text-white text-center">
                  <h4 class="mb-0">Contact Us</h4>
                </div>
                <div class="card-body">
                  <form>
                    <div class="form-row">
                      <div class="form-group col-md-6">
                        <label for="inputName">Name</label>
                        <input type="text" class="form-control" id="inputName" placeholder="Your Name">
                      </div>
                      <div class="form-group col-md-6">
                        <label for="inputEmail">Email</label>
                        <input type="email" class="form-control" id="inputEmail" placeholder="Your Email">
                      </div>
                    </div>
                    <div class="form-group">
                      <label for="inputSubject">Subject</label>
                      <input type="text" class="form-control" id="inputSubject" placeholder="Subject">
                    </div>
                    <div class="form-group">
                      <label for="inputMessage">Message</label>
                      <textarea class="form-control" id="inputMessage" rows="5" placeholder="Your Message"></textarea>
                    </div>
                    <div class="text-center">
                      <button type="submit" class="btn btn-primary">Send Message</button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    `,
    attributes: { class: 'fa fa-envelope' }
  });

  // Footer
  editor.BlockManager.add('footer', {
    label: 'Footer',
    category: 'custom-blocks',
    content: `
      <footer class="footer bg-dark text-white py-5">
        <div class="container">
          <div class="row">
            <div class="col-md-4 mb-4">
              <h5>About Us</h5>
              <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam tincidunt arcu vel arcu fermentum, eget accumsan dolor dignissim.</p>
            </div>
            <div class="col-md-4 mb-4">
              <h5>Quick Links</h5>
              <ul class="list-unstyled">
                <li><a href="#" class="text-white">Home</a></li>
                <li><a href="#" class="text-white">About</a></li>
                <li><a href="#" class="text-white">Services</a></li>
                <li><a href="#" class="text-white">Contact</a></li>
              </ul>
            </div>
            <div class="col-md-4 mb-4">
              <h5>Contact Us</h5>
              <address>
                <strong>Company, Inc.</strong><br>
                123 Main St, Suite 456<br>
                San Francisco, CA 94107<br>
                <abbr title="Phone">P:</abbr> (123) 456-7890
              </address>
              <div class="social-icons">
                <a href="#" class="text-white mr-3"><i class="fab fa-facebook-f"></i></a>
                <a href="#" class="text-white mr-3"><i class="fab fa-twitter"></i></a>
                <a href="#" class="text-white mr-3"><i class="fab fa-instagram"></i></a>
                <a href="#" class="text-white"><i class="fab fa-linkedin-in"></i></a>
              </div>
            </div>
          </div>
          <div class="row mt-3">
            <div class="col-12 text-center">
              <p class="mb-0">&copy; 2023 Company, Inc. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    `,
    attributes: { class: 'fa fa-window-minimize' }
  });

  // Call to Action
  editor.BlockManager.add('call-to-action', {
    label: 'Call to Action',
    category: 'custom-blocks',
    content: `
      <section class="cta-section py-5 bg-primary text-white">
        <div class="container">
          <div class="row align-items-center">
            <div class="col-md-8 mb-3 mb-md-0">
              <h2 class="mb-0">Ready to get started?</h2>
              <p class="lead mb-0">Sign up now and get 30 days free trial.</p>
            </div>
            <div class="col-md-4 text-md-right">
              <button class="btn btn-light btn-lg">Sign Up Now</button>
            </div>
          </div>
        </div>
      </section>
    `,
    attributes: { class: 'fa fa-bullhorn' }
  });

  // Team Section
  editor.BlockManager.add('team-section', {
    label: 'Team Section',
    category: 'custom-blocks',
    content: `
      <section class="team-section py-5">
        <div class="container">
          <div class="row text-center mb-5">
            <div class="col-12">
              <h2>Our Team</h2>
              <p class="lead">Meet the people behind our success</p>
            </div>
          </div>
          <div class="row">
            <div class="col-md-3 mb-4">
              <div class="card h-100">
                <img src="https://via.placeholder.com/300" class="card-img-top" alt="Team Member">
                <div class="card-body text-center">
                  <h5 class="card-title">John Doe</h5>
                  <p class="card-text text-muted">CEO & Founder</p>
                  <div class="social-icons">
                    <a href="#" class="text-dark mr-2"><i class="fab fa-twitter"></i></a>
                    <a href="#" class="text-dark mr-2"><i class="fab fa-linkedin-in"></i></a>
                    <a href="#" class="text-dark"><i class="fas fa-envelope"></i></a>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-md-3 mb-4">
              <div class="card h-100">
                <img src="https://via.placeholder.com/300" class="card-img-top" alt="Team Member">
                <div class="card-body text-center">
                  <h5 class="card-title">Jane Smith</h5>
                  <p class="card-text text-muted">CTO</p>
                  <div class="social-icons">
                    <a href="#" class="text-dark mr-2"><i class="fab fa-twitter"></i></a>
                    <a href="#" class="text-dark mr-2"><i class="fab fa-linkedin-in"></i></a>
                    <a href="#" class="text-dark"><i class="fas fa-envelope"></i></a>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-md-3 mb-4">
              <div class="card h-100">
                <img src="https://via.placeholder.com/300" class="card-img-top" alt="Team Member">
                <div class="card-body text-center">
                  <h5 class="card-title">Mike Johnson</h5>
                  <p class="card-text text-muted">Lead Developer</p>
                  <div class="social-icons">
                    <a href="#" class="text-dark mr-2"><i class="fab fa-twitter"></i></a>
                    <a href="#" class="text-dark mr-2"><i class="fab fa-linkedin-in"></i></a>
                    <a href="#" class="text-dark"><i class="fas fa-envelope"></i></a>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-md-3 mb-4">
              <div class="card h-100">
                <img src="https://via.placeholder.com/300" class="card-img-top" alt="Team Member">
                <div class="card-body text-center">
                  <h5 class="card-title">Sarah Williams</h5>
                  <p class="card-text text-muted">Marketing Director</p>
                  <div class="social-icons">
                    <a href="#" class="text-dark mr-2"><i class="fab fa-twitter"></i></a>
                    <a href="#" class="text-dark mr-2"><i class="fab fa-linkedin-in"></i></a>
                    <a href="#" class="text-dark"><i class="fas fa-envelope"></i></a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    `,
    attributes: { class: 'fa fa-users' }
  });
};
