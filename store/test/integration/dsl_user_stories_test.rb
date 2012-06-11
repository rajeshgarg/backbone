# Copyright (c) 2006 The Pragmatic Programmers, LLC.
# Reproduced from the book "Agile Web Development with Rails, 2nd Ed.",
# published by The Pragmatic Bookshelf.
# Available from www.pragmaticprogrammer.com/titles/rails2
# 
# Permission is hereby granted, free of charge, to any person obtaining a copy
# of this source code (the "Software"), to deal in the Software without
# restriction, including without limitation the rights to use, copy, modify,
# merge, publish, distribute, sublicense, and/or sell copies of the Software,
# and to permit persons to whom the Software is furnished to do so, subject to
# the following conditions:
# 
# 1) This Software cannot be used in any training course or seminar, whether
# presented live, via video, audio, screencast, or any other media, without
# explicit prior permission from the publisher.
# 
# 2) The above copyright notice and this permission notice shall be included in
# all copies or substantial portions of the Software.
# 
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
# IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
# FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
# AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
# LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
# OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
# THE SOFTWARE. 

require "#{File.dirname(__FILE__)}/../test_helper"

class DslUserStoriesTest < ActionController::IntegrationTest
  fixtures :products


  #START:daves_details
  DAVES_DETAILS = {
      :name     => "Dave Thomas",
      :address  => "123 The Street",
      :email    => "dave@pragprog.com",
      :pay_type => "check"
  }
  #END:daves_details

  MIKES_DETAILS = {
      :name     => "Mike Clark",
      :address  => "345 The Avenue",
      :email    => "mike@pragmaticstudio.com",
      :pay_type => "cc"
  }
  
  
    
  def setup
    LineItem.delete_all
    Order.delete_all
    @ruby_book = products(:ruby_book)
    @rails_book = products(:rails_book)
  end 
  
  # A user goes to the store index page. They select a product,
  # adding it to their cart. They then check out, filling in
  # their details on the checkout form. When they submit,
  # an order is created in the database containing
  # their information, along with a single line item
  # corresponding to the product they added to their cart.
  
  #START:test_buying_a_product
  def test_buying_a_product
    dave = regular_user
    dave.get "/store/index"
    dave.is_viewing "index"
    dave.buys_a @ruby_book
    dave.has_a_cart_containing @ruby_book
    dave.checks_out DAVES_DETAILS
    dave.is_viewing "index"
    check_for_order DAVES_DETAILS, @ruby_book
  end
  #END:test_buying_a_product

  #START:test_two_people_buying
  def test_two_people_buying
    dave = regular_user
        mike = regular_user
    dave.buys_a @ruby_book
        mike.buys_a @rails_book
    dave.has_a_cart_containing @ruby_book
    dave.checks_out DAVES_DETAILS
        mike.has_a_cart_containing @rails_book
    check_for_order DAVES_DETAILS, @ruby_book
        mike.checks_out MIKES_DETAILS
        check_for_order MIKES_DETAILS, @rails_book
  end
  #END:test_two_people_buying
  
  #START:regular_user
  def regular_user
    open_session do |user|
      def user.is_viewing(page)
        assert_response :success
        assert_template page
      end
    
      def user.buys_a(product)
        xml_http_request "/store/add_to_cart", :id => product.id
        assert_response :success 
      end
    
      def user.has_a_cart_containing(*products)
        cart = session[:cart]
        assert_equal products.size, cart.items.size
        for item in cart.items
          assert products.include?(item.product)
        end
      end
    
      def user.checks_out(details)
        post "/store/checkout"
        assert_response :success
        assert_template "checkout"

        post_via_redirect "/store/save_order",
                          :order => {
                             :name     => details[:name],
                             :address  => details[:address],
                             :email    => details[:email],
                             :pay_type => details[:pay_type]
                           }
        assert_response :success
        assert_template "index"
        assert_equal 0, session[:cart].items.size
      end
    end  
  end
  #END:regular_user   
  
  def check_for_order(details, *products)
    order = Order.find_by_name(details[:name])
    assert_not_nil order
    
    assert_equal details[:name],     order.name
    assert_equal details[:address],  order.address
    assert_equal details[:email],    order.email
    assert_equal details[:pay_type], order.pay_type
    
    assert_equal products.size, order.line_items.size
    for line_item in order.line_items
      assert products.include?(line_item.product)
    end
  end
end
